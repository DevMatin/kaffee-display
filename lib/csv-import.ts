import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase';
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type CsvRecord = Record<string, string>;

function getAdminClient(override?: SupabaseClient) {
  if (override) return override;
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

// Robust CSV parser that supports multiline quoted fields.
function parseCsv(text: string): CsvRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      pushField();
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      pushField();
      if (row.length > 0) pushRow();
      if (c === '\r' && text[i + 1] === '\n') i++; // handle CRLF
    } else {
      field += c;
    }
  }
  pushField();
  if (row.length > 0) pushRow();

  if (!rows.length) return [];
  const headers = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((v) => v && v.trim() !== ''));

  return dataRows.map((cols) => {
    const rec: CsvRecord = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] ?? '';
    });
    return rec;
  });
}

function toNumber(v: string): number | null {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function firstUrl(images: string): string | null {
  const match = images.match(/https?:\/\/\S+/);
  return match ? match[0].replace(/["']/g, '') : null;
}

async function upsertCategory(admin: SupabaseClient, name: string): Promise<string | null> {
  if (!name) return null;
  const slug = toSlug(name);
  const { data, error } = await admin
    .from('product_categories')
    .upsert({ name, slug }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (error) throw error;
  return data?.id || null;
}

async function upsertTag(admin: SupabaseClient, name: string): Promise<string | null> {
  if (!name) return null;
  const slug = toSlug(name);
  const { data, error } = await admin
    .from('product_tags')
    .upsert({ name, slug }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (error) throw error;
  return data?.id || null;
}

async function setCoffeeCategories(admin: SupabaseClient, coffeeId: string, categoryNames: string[]) {
  for (const name of categoryNames) {
    const id = await upsertCategory(admin, name.trim());
    if (!id) continue;
    await admin
      .from('coffee_categories')
      .upsert({ coffee_id: coffeeId, category_id: id }, { onConflict: 'coffee_id,category_id' });
  }
}

async function setCoffeeTags(admin: SupabaseClient, coffeeId: string, tagNames: string[]) {
  for (const name of tagNames) {
    const id = await upsertTag(admin, name.trim());
    if (!id) continue;
    await admin
      .from('coffee_tags')
      .upsert({ coffee_id: coffeeId, tag_id: id }, { onConflict: 'coffee_id,tag_id' });
  }
}

async function setCoffeeAttributes(
  admin: SupabaseClient,
  coffeeId: string,
  attrs: Record<string, string>
) {
  for (const [key, value] of Object.entries(attrs)) {
    if (!value) continue;
    await admin
      .from('coffee_attributes')
      .upsert(
        { coffee_id: coffeeId, key, value, source: 'csv' },
        { onConflict: 'coffee_id,key' }
      );
  }
}

function mapRecord(rec: CsvRecord) {
  const image_url = firstUrl(rec['images'] || '');
  const regular_price = toNumber(rec['regular_price'] || rec['sale_price'] || '');
  const sale_price = toNumber(rec['sale_price'] || '');
  return {
    name: rec['post_title'] || '',
    slug: rec['post_name'] || '',
    short_description: rec['post_excerpt'] || null,
    description: rec['post_content'] || null,
    sku: rec['sku'] || null,
    regular_price,
    sale_price,
    currency: 'EUR',
    stock_status: rec['stock_status'] || null,
    manage_stock: rec['manage_stock'] === 'yes',
    stock_quantity: toNumber(rec['stock']) ?? null,
    product_url: rec['product_page_url'] || null,
    external_id: rec['ID'] || null,
    image_url,
    country: null,
    region_id: null,
    roast_level: null,
    processing_method: null,
    varietal: null,
    altitude_min: null,
    altitude_max: null,
  };
}

export async function importCsvText(csvText: string, adminOverride?: SupabaseClient): Promise<ImportResult> {
  const admin = getAdminClient(adminOverride);
  if (!admin) throw new Error('Supabase admin client not configured');

  const rows = parseCsv(csvText);
  let successCount = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rec = rows[i];
    try {
      const coffee = mapRecord(rec);
      if (!coffee.name) throw new Error('Name fehlt');
      const { data, error } = await admin
        .from('coffees')
        .upsert(coffee, { onConflict: 'slug' })
        .select('id, slug')
        .single();
      if (error) throw error;

      const coffeeId = data?.id;
      if (coffeeId) {
        const catRaw = rec['tax:product_cat'] || '';
        const tagRaw = rec['tax:product_tag'] || '';
        const cats = catRaw.split('|').map((c) => c.trim()).filter(Boolean);
        const tags = tagRaw.split('|').map((t) => t.trim()).filter(Boolean);
        await setCoffeeCategories(admin, coffeeId, cats);
        await setCoffeeTags(admin, coffeeId, tags);

        const attrs: Record<string, string> = {};
        Object.entries(rec).forEach(([k, v]) => {
          if (k.startsWith('attribute:') && v) {
            attrs[k.replace('attribute:', '')] = v;
          }
        });
        await setCoffeeAttributes(admin, coffeeId, attrs);
      }
      successCount++;
    } catch (err: any) {
      errors.push({ row: i + 2, message: err?.message || 'Unbekannter Fehler' });
    }
  }

  return { successCount, errorCount: errors.length, errors };
}

