import { supabase, supabaseAdmin } from './supabase';
import { logger } from './logger';
import { deleteImage } from './storage';
import type { Coffee, Region, FlavorNote, BrewMethod } from './types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCoffee(coffeeData: Partial<Coffee>, regionIds: string[] = []): Promise<Coffee> {
  const startTime = performance.now();
  try {
    logger.debug('Creating coffee', { name: coffeeData.name, image_url: coffeeData.image_url });
    console.log('createCoffee called with:', { coffeeData, image_url: coffeeData.image_url });

    if (!coffeeData.name) {
      throw new Error('Name is required');
    }

    const slug = coffeeData.slug || generateSlug(coffeeData.name);

    const primaryRegionId = regionIds[0] || coffeeData.region_id || null;

    const insertData = {
      ...coffeeData,
      region_id: primaryRegionId,
      slug,
    };

    console.log('Sending to Supabase:', insertData);
    console.log('Image URL in insertData:', insertData.image_url);
    console.log('Type of image_url:', typeof insertData.image_url);

    const insertPayload = { ...insertData };
    console.log('Insert payload:', JSON.stringify(insertPayload, null, 2));

    const { data, error } = await supabase
      .from('coffees')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      logger.error('Error creating coffee', error);
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Supabase returned:', data);
    logger.debug('Coffee created successfully', { id: data.id, image_url: data.image_url });

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'insert', duration, { id: data.id });

    await manageCoffeeRegions(data.id, regionIds);

    return data;
  } catch (error) {
    logger.error('Failed to create coffee', error);
    console.error('createCoffee error:', error);
    throw error;
  }
}

export async function updateCoffee(id: string, coffeeData: Partial<Coffee>, regionIds: string[] = []): Promise<Coffee> {
  const startTime = performance.now();
  try {
    logger.debug('Updating coffee', { id, image_url: coffeeData.image_url });
    console.log('updateCoffee called with:', { id, coffeeData, image_url: coffeeData.image_url });

    if (coffeeData.name && !coffeeData.slug) {
      coffeeData.slug = generateSlug(coffeeData.name);
    }

    const primaryRegionId = regionIds[0] || coffeeData.region_id || null;
    coffeeData.region_id = primaryRegionId;

    console.log('Sending to Supabase:', coffeeData);
    console.log('Image URL being sent:', coffeeData.image_url);
    console.log('Type of image_url:', typeof coffeeData.image_url);

    const updatePayload = { ...coffeeData };
    console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

    const { data, error } = await supabase
      .from('coffees')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating coffee', error);
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Supabase returned:', data);
    logger.debug('Coffee updated successfully', { id: data.id, image_url: data.image_url });

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'update', duration, { id });

    await manageCoffeeRegions(id, regionIds);

    return data;
  } catch (error) {
    logger.error('Failed to update coffee', error);
    console.error('updateCoffee error:', error);
    throw error;
  }
}

export async function manageCoffeeRegions(coffeeId: string, regionIds: string[]): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Managing coffee regions', { coffeeId, regionIds });

    await supabase.from('coffee_regions').delete().eq('coffee_id', coffeeId);

    if (regionIds.length > 0) {
      const inserts = regionIds.map((regionId) => ({
        coffee_id: coffeeId,
        region_id: regionId,
      }));

      const { error } = await supabase.from('coffee_regions').insert(inserts);

      if (error) {
        logger.error('Error managing coffee regions', error);
        throw error;
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffee_regions', 'manage', duration, { coffeeId, count: regionIds.length });
  } catch (error) {
    logger.error('Failed to manage coffee regions', error);
    throw error;
  }
}

export async function deleteCoffee(id: string): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Deleting coffee', { id });

    const { data: coffee, error: fetchError } = await supabase
      .from('coffees')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('Error fetching coffee for deletion', fetchError);
    }

    if (coffee?.image_url) {
      try {
        await deleteImage(coffee.image_url);
      } catch (error) {
        logger.error('Error deleting coffee image', error);
      }
    }

    const { error } = await supabase.from('coffees').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting coffee', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'delete', duration, { id });
  } catch (error) {
    logger.error('Failed to delete coffee', error);
    throw error;
  }
}

export async function manageCoffeeFlavorNotes(
  coffeeId: string,
  flavorNoteIds: string[]
): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Managing coffee flavor notes', { coffeeId, flavorNoteIds });

    await supabase.from('coffee_flavor_notes').delete().eq('coffee_id', coffeeId);

    if (flavorNoteIds.length > 0) {
      const inserts = flavorNoteIds.map((flavorId) => ({
        coffee_id: coffeeId,
        flavor_id: flavorId,
      }));

      const { error } = await supabase.from('coffee_flavor_notes').insert(inserts);

      if (error) {
        logger.error('Error managing flavor notes', error);
        throw error;
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffee_flavor_notes', 'manage', duration, { coffeeId, count: flavorNoteIds.length });
  } catch (error) {
    logger.error('Failed to manage flavor notes', error);
    throw error;
  }
}

export async function manageCoffeeBrewMethods(
  coffeeId: string,
  brewMethodIds: string[]
): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Managing coffee brew methods', { coffeeId, brewMethodIds });

    await supabase.from('coffee_brew_methods').delete().eq('coffee_id', coffeeId);

    if (brewMethodIds.length > 0) {
      const inserts = brewMethodIds.map((brewId) => ({
        coffee_id: coffeeId,
        brew_id: brewId,
      }));

      const { error } = await supabase.from('coffee_brew_methods').insert(inserts);

      if (error) {
        logger.error('Error managing brew methods', error);
        throw error;
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffee_brew_methods', 'manage', duration, { coffeeId, count: brewMethodIds.length });
  } catch (error) {
    logger.error('Failed to manage brew methods', error);
    throw error;
  }
}

export async function createRegion(regionData: Partial<Region>): Promise<Region> {
  const startTime = performance.now();
  try {
    logger.debug('Creating region', { name: regionData.region_name });

    const { data, error } = await supabase.from('regions').insert(regionData).select().single();

    if (error) {
      logger.error('Error creating region', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'insert', duration, { id: data.id });

    return data;
  } catch (error) {
    logger.error('Failed to create region', error);
    throw error;
  }
}

export async function updateRegion(id: string, regionData: Partial<Region>): Promise<Region> {
  const startTime = performance.now();
  try {
    logger.debug('Updating region', { id });

    const { data, error } = await supabase
      .from('regions')
      .update(regionData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating region', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'update', duration, { id });

    return data;
  } catch (error) {
    logger.error('Failed to update region', error);
    throw error;
  }
}

export async function deleteRegion(id: string): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Deleting region', { id });

    const { error } = await supabase.from('regions').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting region', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'delete', duration, { id });
  } catch (error) {
    logger.error('Failed to delete region', error);
    throw error;
  }
}

export async function createFlavorNote(flavorNoteData: Partial<FlavorNote>): Promise<FlavorNote> {
  const startTime = performance.now();
  try {
    logger.debug('Creating flavor note', { name: flavorNoteData.name });

    const { data, error } = await supabase.from('flavor_notes').insert(flavorNoteData).select().single();

    if (error) {
      logger.error('Error creating flavor note', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_notes', 'insert', duration, { id: data.id });

    return data;
  } catch (error) {
    logger.error('Failed to create flavor note', error);
    throw error;
  }
}

export async function updateFlavorNote(id: string, flavorNoteData: Partial<FlavorNote>): Promise<FlavorNote> {
  const startTime = performance.now();
  try {
    logger.debug('Updating flavor note', { id });

    const { data, error } = await supabase
      .from('flavor_notes')
      .update(flavorNoteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating flavor note', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_notes', 'update', duration, { id });

    return data;
  } catch (error) {
    logger.error('Failed to update flavor note', error);
    throw error;
  }
}

export async function deleteFlavorNote(id: string): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Deleting flavor note', { id });

    const { error } = await supabase.from('flavor_notes').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting flavor note', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_notes', 'delete', duration, { id });
  } catch (error) {
    logger.error('Failed to delete flavor note', error);
    throw error;
  }
}

export async function createBrewMethod(brewMethodData: Partial<BrewMethod>): Promise<BrewMethod> {
  const startTime = performance.now();
  try {
    logger.debug('Creating brew method', { name: brewMethodData.name });

    const { data, error } = await supabase.from('brew_methods').insert(brewMethodData).select().single();

    if (error) {
      logger.error('Error creating brew method', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('brew_methods', 'insert', duration, { id: data.id });

    return data;
  } catch (error) {
    logger.error('Failed to create brew method', error);
    throw error;
  }
}

export async function updateBrewMethod(id: string, brewMethodData: Partial<BrewMethod>): Promise<BrewMethod> {
  const startTime = performance.now();
  try {
    logger.debug('Updating brew method', { id });

    const { data, error } = await supabase
      .from('brew_methods')
      .update(brewMethodData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating brew method', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('brew_methods', 'update', duration, { id });

    return data;
  } catch (error) {
    logger.error('Failed to update brew method', error);
    throw error;
  }
}

export async function deleteBrewMethod(id: string): Promise<void> {
  const startTime = performance.now();
  try {
    logger.debug('Deleting brew method', { id });

    const { error } = await supabase.from('brew_methods').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting brew method', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('brew_methods', 'delete', duration, { id });
  } catch (error) {
    logger.error('Failed to delete brew method', error);
    throw error;
  }
}

