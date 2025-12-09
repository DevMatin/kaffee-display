import { supabase } from './supabase';
import { logger } from './logger';
import type { Region, Coffee, FlavorNote, BrewMethod, CoffeeImage, FlavorCategory, FlavorWheelNode } from './types';

export async function getRegions(): Promise<Region[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all regions');
    const { data, error } = await supabase.from('regions').select('*').order('country', { ascending: true });

    if (error) {
      logger.error('Error fetching regions', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'select', duration, { count: data?.length || 0 });

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch regions', error);
    throw error;
  }
}

export async function getRegionById(id: string): Promise<Region | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching region by id', { id });
    const { data, error } = await supabase.from('regions').select('*').eq('id', id).single();

    if (error) {
      logger.error('Error fetching region', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'selectById', duration, { id });

    return data;
  } catch (error) {
    logger.error('Failed to fetch region', error);
    throw error;
  }
}

export async function getFlavorNotes(): Promise<FlavorNote[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all flavor notes with categories');
    const { data, error } = await supabase
      .from('flavor_notes')
      .select(`
        *,
        category:flavor_categories(
          id,
          name,
          level,
          parent_id,
          color_hex
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching flavor notes', error);
      throw error;
    }

    const categoryIds = new Set<string>();
    (data || []).forEach((note: any) => {
      const category = Array.isArray(note.category) ? note.category[0] || null : note.category || null;
      if (category && category.parent_id) {
        categoryIds.add(category.parent_id);
      }
    });

    const parentCategoriesMap = new Map<string, FlavorCategory>();
    if (categoryIds.size > 0) {
      const { data: parents, error: parentsError } = await supabase
        .from('flavor_categories')
        .select('*')
        .in('id', Array.from(categoryIds));

      if (!parentsError && parents) {
        parents.forEach((parent: FlavorCategory) => {
          parentCategoriesMap.set(parent.id, parent);
        });
      }
    }

    const notes: FlavorNote[] = (data || []).map((note: any) => {
      const category = Array.isArray(note.category) ? note.category[0] || null : note.category || null;
      if (category && category.parent_id) {
        const parent = parentCategoriesMap.get(category.parent_id) || null;
        return {
          ...note,
          category: category ? { ...category, parent } : null,
        };
      }
      return {
        ...note,
        category: category || null,
      };
    });

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_notes', 'select', duration, { count: notes.length });

    return notes;
  } catch (error) {
    logger.error('Failed to fetch flavor notes', error);
    throw error;
  }
}

export async function getBrewMethods(): Promise<BrewMethod[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all brew methods');
    const { data, error } = await supabase.from('brew_methods').select('*').order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching brew methods', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('brew_methods', 'select', duration, { count: data?.length || 0 });

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch brew methods', error);
    throw error;
  }
}

export async function getCoffees(): Promise<Coffee[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all coffees with relations');
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        region:regions(*),
        coffee_regions(
          region:regions(*)
        ),
        coffee_flavor_notes(
          flavor_note:flavor_notes(*)
        ),
        coffee_brew_methods(
          brew_method:brew_methods(*)
        ),
        coffee_processing_methods(
          processing_method:processing_methods(*)
        ),
        coffee_varietals(
          varietal:varietals(*)
        ),
        coffee_images(*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching coffees', error);
      throw error;
    }

    const coffees: Coffee[] =
      data?.map((coffee: any) => ({
        ...coffee,
        region: coffee.region || null,
        regions: coffee.coffee_regions?.map((cr: any) => cr.region).filter(Boolean) || [],
        flavor_notes: coffee.coffee_flavor_notes?.map((cfn: any) => cfn.flavor_note).filter(Boolean) || [],
        brew_methods: coffee.coffee_brew_methods?.map((cbm: any) => cbm.brew_method).filter(Boolean) || [],
        processing_methods: coffee.coffee_processing_methods?.map((cpm: any) => cpm.processing_method).filter(Boolean) || [],
        varietals: coffee.coffee_varietals?.map((cv: any) => cv.varietal).filter(Boolean) || [],
        images: coffee.coffee_images || [],
      })) || [];

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'select', duration, { count: coffees.length });

    return coffees;
  } catch (error) {
    logger.error('Failed to fetch coffees', error);
    throw error;
  }
}

export async function getCoffeeBySlug(slug: string): Promise<Coffee | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching coffee by slug', { slug });
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        region:regions(*),
        coffee_regions(
          region:regions(*)
        ),
        coffee_flavor_notes(
          flavor_note:flavor_notes(*)
        ),
        coffee_brew_methods(
          brew_method:brew_methods(*)
        ),
        coffee_processing_methods(
          processing_method:processing_methods(*)
        ),
        coffee_varietals(
          varietal:varietals(*)
        ),
        coffee_images(*)
      `
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching coffee by slug', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const coffee: Coffee = {
      ...data,
      region: data.region || null,
      regions: data.coffee_regions?.map((cr: any) => cr.region).filter(Boolean) || [],
      flavor_notes: data.coffee_flavor_notes?.map((cfn: any) => cfn.flavor_note).filter(Boolean) || [],
      brew_methods: data.coffee_brew_methods?.map((cbm: any) => cbm.brew_method).filter(Boolean) || [],
      images: data.coffee_images || [],
    };

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'selectBySlug', duration, { slug });

    return coffee;
  } catch (error) {
    logger.error('Failed to fetch coffee by slug', error);
    throw error;
  }
}

export async function getCoffeeById(id: string): Promise<Coffee | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching coffee by id', { id });
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        region:regions(*),
        coffee_regions(
          region:regions(*)
        ),
        coffee_flavor_notes(
          flavor_note:flavor_notes(*)
        ),
        coffee_brew_methods(
          brew_method:brew_methods(*)
        ),
        coffee_processing_methods(
          processing_method:processing_methods(*)
        ),
        coffee_varietals(
          varietal:varietals(*)
        ),
        coffee_images(*)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching coffee by id', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    const coffee: Coffee = {
      ...data,
      region: data.region || null,
      regions: data.coffee_regions?.map((cr: any) => cr.region).filter(Boolean) || [],
      flavor_notes: data.coffee_flavor_notes?.map((cfn: any) => cfn.flavor_note).filter(Boolean) || [],
      brew_methods: data.coffee_brew_methods?.map((cbm: any) => cbm.brew_method).filter(Boolean) || [],
      processing_methods: data.coffee_processing_methods?.map((cpm: any) => cpm.processing_method).filter(Boolean) || [],
      varietals: data.coffee_varietals?.map((cv: any) => cv.varietal).filter(Boolean) || [],
      images: data.coffee_images || [],
    };

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'selectById', duration, { id });

    return coffee;
  } catch (error) {
    logger.error('Failed to fetch coffee by id', error);
    throw error;
  }
}

export async function getFlavorWheel(): Promise<FlavorWheelNode> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching flavor wheel structure');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('flavor_categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (categoriesError) {
      logger.error('Error fetching flavor categories', categoriesError);
      throw categoriesError;
    }

    const { data: notes, error: notesError } = await supabase
      .from('flavor_notes')
      .select('*')
      .not('category_id', 'is', null)
      .order('name', { ascending: true });

    if (notesError) {
      logger.error('Error fetching flavor notes', notesError);
      throw notesError;
    }

    const categoriesMap = new Map<string, FlavorCategory>();
    const categoriesByParent = new Map<string | null, FlavorCategory[]>();
    const notesByCategory = new Map<string, FlavorNote[]>();

    categories?.forEach((cat: FlavorCategory) => {
      categoriesMap.set(cat.id, cat);
      const parentKey = cat.parent_id || null;
      if (!categoriesByParent.has(parentKey)) {
        categoriesByParent.set(parentKey, []);
      }
      categoriesByParent.get(parentKey)!.push(cat);
    });

    notes?.forEach((note: FlavorNote) => {
      if (note.category_id) {
        if (!notesByCategory.has(note.category_id)) {
          notesByCategory.set(note.category_id, []);
        }
        notesByCategory.get(note.category_id)!.push(note);
      }
    });

    function buildNode(category: FlavorCategory): FlavorWheelNode {
      const children: FlavorWheelNode[] = [];
      
      const subCategories = categoriesByParent.get(category.id) || [];
      subCategories.forEach((subCat) => {
        children.push(buildNode(subCat));
      });

      const categoryNotes = notesByCategory.get(category.id) || [];
      categoryNotes.forEach((note) => {
        children.push({
          id: note.id,
          name: note.name,
          label: note.name,
          level: 3,
          color: note.color_hex || undefined,
          value: 1,
        });
      });

      return {
        id: category.id,
        name: category.name,
        label: category.name,
        level: category.level,
        color: category.color_hex || undefined,
        children: children.length > 0 ? children : undefined,
      };
    }

    const rootCategories = categoriesByParent.get(null) || [];
    const rootNode: FlavorWheelNode = {
      id: 'flavor-wheel-root',
      name: 'Flavor Wheel',
      label: 'Flavor Wheel',
      children: rootCategories.map((cat) => buildNode(cat)),
    };

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_wheel', 'select', duration, { 
      categories: categories?.length || 0,
      notes: notes?.length || 0 
    });

    return rootNode;
  } catch (error) {
    logger.error('Failed to fetch flavor wheel', error);
    throw error;
  }
}

