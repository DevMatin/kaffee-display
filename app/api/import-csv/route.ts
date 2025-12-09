import { NextResponse } from 'next/server';
import { importCsvText } from '@/lib/csv-import';
import { createClient } from '@supabase/supabase-js';

// Service-Role-Keys stehen nur in der Node-Runtime sicher zur Verfügung.
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !key) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY oder URL fehlt' }, { status: 500 });
    }
    
    const admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Keine Datei übermittelt' }, { status: 400 });
    }

    const text = await file.text();
    const result = await importCsvText(text, admin);

    return NextResponse.json({
      success: true,
      successCount: result.successCount,
      errorCount: result.errorCount,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('CSV Import error', error);
    return NextResponse.json({ error: error?.message || 'Import fehlgeschlagen' }, { status: 500 });
  }
}

