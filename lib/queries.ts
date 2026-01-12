import { supabase, supabaseAdmin } from './supabase';
import { logger } from './logger';
import type {
  Region,
  Coffee,
  FlavorNote,
  BrewMethod,
  CoffeeImage,
  FlavorCategory,
  FlavorWheelNode,
  RoastLevel,
} from './types';

// Basic helper to pick translation without enforcing field types
const pickTranslation = (items: any[] | null | undefined, locale: string): any =>
  items?.find((item) => item?.locale === locale) || null;

export async function getRegions(locale = 'de'): Promise<Region[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all regions');
    const { data, error } = await supabase
      .from('regions')
      .select(
        `
        *,
        translations:regions_translations(locale, region_name, description)
      `
      )
      .order('country', { ascending: true });

    if (error) {
      logger.error('Error fetching regions', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'select', duration, { count: data?.length || 0 });

    const regions =
      data?.map((region: any) => {
        const translation = pickTranslation(
          region.translations as { locale: string; region_name?: string; description?: string }[] | undefined,
          locale
        );
        return {
          ...region,
          region_name: translation?.region_name || region.region_name,
          description: translation?.description ?? region.description,
        } as Region;
      }) || [];

    return regions;
  } catch (error) {
    logger.error('Failed to fetch regions', error);
    throw error;
  }
}

export async function getRegionById(id: string, locale = 'de'): Promise<Region | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching region by id', { id });
    const { data, error } = await supabase
      .from('regions')
      .select(
        `
        *,
        translations:regions_translations(locale, region_name, description)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching region', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('regions', 'selectById', duration, { id });

    const translation = pickTranslation(
      data?.translations as { locale: string; region_name?: string; description?: string }[] | undefined,
      locale
    );
    return (
      data && {
        ...data,
        region_name: translation?.region_name || data.region_name,
        description: translation?.description ?? data.description,
      }
    );
  } catch (error) {
    logger.error('Failed to fetch region', error);
    throw error;
  }
}

export async function getFlavorNotes(locale = 'de'): Promise<FlavorNote[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all flavor notes with categories');
    const { data, error } = await supabase
      .from('flavor_notes')
      .select(`
        *,
        translations:flavor_notes_translations(locale, name, description),
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
      const translation = pickTranslation(note.translations, locale);
      const translatedNote = {
        ...note,
        name: translation?.name || note.name,
        description: translation?.description ?? note.description,
      };
      const category = Array.isArray(note.category) ? note.category[0] || null : note.category || null;
      if (category && category.parent_id) {
        const parent = parentCategoriesMap.get(category.parent_id) || null;
        return {
          ...translatedNote,
          category: category ? { ...category, parent } : null,
        };
      }
      return {
        ...translatedNote,
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

export async function getFlavorCategories(locale = 'de'): Promise<FlavorCategory[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching flavor categories');

    const { data, error } = await supabase
      .from('flavor_categories')
      .select(`
        *,
        translations:flavor_categories_translations(locale, name)
      `)
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching flavor categories', error);
      throw error;
    }

    const categories: FlavorCategory[] =
      (data || []).map((cat: any) => {
        const translation = pickTranslation(cat.translations, locale);
        return { ...cat, name: translation?.name || cat.name };
      }) || [];
    const map = new Map<string, FlavorCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));
    categories.forEach((cat) => {
      cat.parent = cat.parent_id ? map.get(cat.parent_id) || null : null;
    });

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_categories', 'select', duration, { count: categories.length });

    return categories;
  } catch (error) {
    logger.error('Failed to fetch flavor categories', error);
    throw error;
  }
}

export async function getFlavorCategoryById(id: string, locale = 'de'): Promise<FlavorCategory | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching flavor category by id', { id });

    const { data, error } = await supabase
      .from('flavor_categories')
      .select(`
        *,
        translations:flavor_categories_translations(locale, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching flavor category by id', error);
      throw error;
    }

    const translation = pickTranslation(data?.translations, locale);
    let category: FlavorCategory | null = data ? { ...data, name: translation?.name || data.name } : null;
    if (category?.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('flavor_categories')
        .select('*')
        .eq('id', category.parent_id)
        .single();
      if (!parentError && parent) {
        category = { ...category, parent };
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('flavor_categories', 'select_one', duration, { id });

    return category;
  } catch (error) {
    logger.error('Failed to fetch flavor category by id', error);
    throw error;
  }
}

export async function getBrewMethods(locale = 'de'): Promise<BrewMethod[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all brew methods');
    const { data, error } = await supabase
      .from('brew_methods')
      .select(`
        *,
        translations:brew_methods_translations(locale, name)
      `)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching brew methods', error);
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('brew_methods', 'select', duration, { count: data?.length || 0 });

    return (
      data?.map((method: any) => {
        const translation = pickTranslation(method.translations, locale);
        return { ...method, name: translation?.name || method.name };
      }) || []
    );
  } catch (error) {
    logger.error('Failed to fetch brew methods', error);
    throw error;
  }
}

export async function getRoastLevels(locale = 'de'): Promise<RoastLevel[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all roast levels');
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('roast_levels')
      .select(`
        *,
        translations:roast_levels_translations(locale, name, description)
      `)
      .order('name', { ascending: true });

    if (error) {
      const errorCode = (error as any)?.code || '';
      const errorMessage = error.message || '';
      if (errorCode === '42P01' || errorMessage.includes('does not exist') || (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
        logger.debug('Roast levels table does not exist yet, returning empty array');
        return [];
      }
      if (errorCode === '42501' || errorMessage.includes('permission denied')) {
        logger.debug('Permission denied for roast_levels table, returning empty array');
        return [];
      }
      logger.error('Error fetching roast levels', error);
      return [];
    }

    const duration = Math.round(performance.now() - startTime);
    logger.query('roast_levels', 'select', duration, { count: data?.length || 0 });

    return (
      data?.map((level: any) => {
        const translation = pickTranslation(level.translations, locale);
        return {
          ...level,
          name: translation?.name || level.name,
          description: translation?.description || null,
        };
      }) || []
    );
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    if (errorCode === '42P01' || errorMessage.includes('does not exist') || (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
      logger.debug('Roast levels table does not exist yet, returning empty array');
      return [];
    }
    if (errorCode === '42501' || errorMessage.includes('permission denied')) {
      logger.debug('Permission denied for roast_levels table, returning empty array');
      return [];
    }
    logger.error('Failed to fetch roast levels', error);
    return [];
  }
}

export async function getCoffees(locale = 'de'): Promise<Coffee[]> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching all coffees with relations');
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        translations:coffees_translations(locale, name, short_description, description),
        roast_level:roast_levels(*, translations:roast_levels_translations(locale, name, description)),
        region:regions(*, translations:regions_translations(locale, region_name, description)),
        coffee_regions(
          region:regions(*, translations:regions_translations(locale, region_name, description))
        ),
        coffee_flavor_notes(
          flavor_category:flavor_categories(
            *,
            translations:flavor_categories_translations(locale, name),
            parent:flavor_categories(
              *,
              translations:flavor_categories_translations(locale, name),
              parent:flavor_categories(
                *,
                translations:flavor_categories_translations(locale, name)
              )
            )
          )
        ),
        coffee_brew_methods(
          brew_method:brew_methods(
            *,
            translations:brew_methods_translations(locale, name)
          )
        ),
        coffee_processing_methods(
          processing_method:processing_methods(
            *,
            translations:processing_methods_translations(locale, name, description)
          )
        ),
        coffee_varietals(
          varietal:varietals(
            *,
            translations:varietals_translations(locale, name, description)
          )
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
      data?.map((coffee: any) => {
        const coffeeTranslation = pickTranslation(coffee.translations, locale);
        
        const roastLevel = coffee.roast_level
          ? {
              ...coffee.roast_level,
              name: pickTranslation(coffee.roast_level.translations, locale)?.name || coffee.roast_level.name,
              description: pickTranslation(coffee.roast_level.translations, locale)?.description || null,
            }
          : null;

        const region = coffee.region
          ? {
              ...coffee.region,
              region_name:
                pickTranslation(coffee.region.translations, locale)?.region_name || coffee.region.region_name,
              description:
                pickTranslation(coffee.region.translations, locale)?.description ?? coffee.region.description,
            }
          : null;

        const regions =
          coffee.coffee_regions?.map((cr: any) => {
            const r = cr.region;
            if (!r) return null;
            const t = pickTranslation(r.translations, locale);
            return {
              ...r,
              region_name: t?.region_name || r.region_name,
              description: t?.description ?? r.description,
            };
          }).filter(Boolean) || [];

        const flavorCategories =
          coffee.coffee_flavor_notes?.map((cfn: any) => {
            const category = cfn.flavor_category;
            if (!category) return null;
            const t = pickTranslation(category.translations, locale);
            const localizedCategory = { ...category, name: t?.name || category.name };
            
            if (localizedCategory.parent) {
              const parentT = pickTranslation(localizedCategory.parent.translations, locale);
              localizedCategory.parent = {
                ...localizedCategory.parent,
                name: parentT?.name || localizedCategory.parent.name,
              };
              
              if (localizedCategory.parent.parent) {
                const grandParentT = pickTranslation(localizedCategory.parent.parent.translations, locale);
                localizedCategory.parent.parent = {
                  ...localizedCategory.parent.parent,
                  name: grandParentT?.name || localizedCategory.parent.parent.name,
                };
              }
            }
            
            return localizedCategory;
          }).filter(Boolean) || [];

        const brewMethods =
          coffee.coffee_brew_methods?.map((cbm: any) => {
            const method = cbm.brew_method;
            if (!method) return null;
            const t = pickTranslation(method.translations, locale);
            return { ...method, name: t?.name || method.name };
          }).filter(Boolean) || [];

        const processingMethods =
          coffee.coffee_processing_methods?.map((cpm: any) => {
            const method = cpm.processing_method;
            if (!method) return null;
            const t = pickTranslation(method.translations, locale);
            return {
              ...method,
              name: t?.name || method.name,
              description: t?.description ?? method.description,
            };
          }).filter(Boolean) || [];

        const varietals =
          coffee.coffee_varietals?.map((cv: any) => {
            const varietal = cv.varietal;
            if (!varietal) return null;
            const t = pickTranslation(varietal.translations, locale);
            return {
              ...varietal,
              name: t?.name || varietal.name,
              description: t?.description ?? varietal.description,
            };
          }).filter(Boolean) || [];

        return {
          ...coffee,
          name: coffeeTranslation?.name || coffee.name,
          short_description: coffeeTranslation?.short_description ?? coffee.short_description,
          description: coffeeTranslation?.description ?? coffee.description,
          roast_level_obj: roastLevel,
          region,
          regions,
          flavor_categories: flavorCategories,
          brew_methods: brewMethods,
          processing_methods: processingMethods,
          varietals,
          images: coffee.coffee_images || [],
        };
      }) || [];

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'select', duration, { count: coffees.length });

    return coffees;
  } catch (error) {
    logger.error('Failed to fetch coffees', error);
    throw error;
  }
}

export async function getCoffeeBySlug(slug: string, locale = 'de'): Promise<Coffee | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching coffee by slug', { slug });
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        translations:coffees_translations(locale, name, short_description, description),
        roast_level:roast_levels(*, translations:roast_levels_translations(locale, name, description)),
        region:regions(*, translations:regions_translations(locale, region_name, description)),
        coffee_regions(
          region:regions(*, translations:regions_translations(locale, region_name, description))
        ),
        coffee_flavor_notes(
          flavor_category:flavor_categories(
            *,
            translations:flavor_categories_translations(locale, name),
            parent:flavor_categories(
              *,
              translations:flavor_categories_translations(locale, name),
              parent:flavor_categories(
                *,
                translations:flavor_categories_translations(locale, name)
              )
            )
          )
        ),
        coffee_brew_methods(
          brew_method:brew_methods(
            *,
            translations:brew_methods_translations(locale, name)
          )
        ),
        coffee_processing_methods(
          processing_method:processing_methods(
            *,
            translations:processing_methods_translations(locale, name, description)
          )
        ),
        coffee_varietals(
          varietal:varietals(
            *,
            translations:varietals_translations(locale, name, description)
          )
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

    const translation = pickTranslation(data.translations, locale);
    
    const roastLevel = data.roast_level
      ? {
          ...data.roast_level,
          name: pickTranslation(data.roast_level.translations, locale)?.name || data.roast_level.name,
          description: pickTranslation(data.roast_level.translations, locale)?.description || null,
        }
      : null;

    const region = data.region
      ? {
          ...data.region,
          region_name: pickTranslation(data.region.translations, locale)?.region_name || data.region.region_name,
          description: pickTranslation(data.region.translations, locale)?.description ?? data.region.description,
        }
      : null;

    const coffee: Coffee = {
      ...data,
      name: translation?.name || data.name,
      short_description: translation?.short_description ?? data.short_description,
      description: translation?.description ?? data.description,
      roast_level_obj: roastLevel,
      region,
      regions:
        data.coffee_regions?.map((cr: any) => {
          const r = cr.region;
          if (!r) return null;
          const t = pickTranslation(r.translations, locale);
          return { ...r, region_name: t?.region_name || r.region_name, description: t?.description ?? r.description };
        }).filter(Boolean) || [],
      flavor_categories:
        data.coffee_flavor_notes?.map((cfn: any) => {
          const category = cfn.flavor_category;
          if (!category) return null;
          const t = pickTranslation(category.translations, locale);
          const localizedCategory = { ...category, name: t?.name || category.name };
          
          if (localizedCategory.parent) {
            const parentT = pickTranslation(localizedCategory.parent.translations, locale);
            localizedCategory.parent = {
              ...localizedCategory.parent,
              name: parentT?.name || localizedCategory.parent.name,
            };
            
            if (localizedCategory.parent.parent) {
              const grandParentT = pickTranslation(localizedCategory.parent.parent.translations, locale);
              localizedCategory.parent.parent = {
                ...localizedCategory.parent.parent,
                name: grandParentT?.name || localizedCategory.parent.parent.name,
              };
            }
          }
          
          return localizedCategory;
        }).filter(Boolean) || [],
      brew_methods:
        data.coffee_brew_methods?.map((cbm: any) => {
          const method = cbm.brew_method;
          if (!method) return null;
          const t = pickTranslation(method.translations, locale);
          return { ...method, name: t?.name || method.name };
        }).filter(Boolean) || [],
      processing_methods:
        data.coffee_processing_methods?.map((cpm: any) => {
          const method = cpm.processing_method;
          if (!method) return null;
          const t = pickTranslation(method.translations, locale);
          return { ...method, name: t?.name || method.name, description: t?.description ?? method.description };
        }).filter(Boolean) || [],
      varietals:
        data.coffee_varietals?.map((cv: any) => {
          const varietal = cv.varietal;
          if (!varietal) return null;
          const t = pickTranslation(varietal.translations, locale);
          return { ...varietal, name: t?.name || varietal.name, description: t?.description ?? varietal.description };
        }).filter(Boolean) || [],
      images: data.coffee_images || [],
    };

    coffee.roast_level_obj = roastLevel;

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'selectBySlug', duration, { slug });

    return coffee;
  } catch (error) {
    logger.error('Failed to fetch coffee by slug', error);
    throw error;
  }
}

export async function getCoffeeById(id: string, locale = 'de'): Promise<Coffee | null> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching coffee by id', { id });
    const { data, error } = await supabase
      .from('coffees')
      .select(
        `
        *,
        translations:coffees_translations(locale, name, short_description, description),
        roast_level:roast_levels(*, translations:roast_levels_translations(locale, name, description)),
        region:regions(*, translations:regions_translations(locale, region_name, description)),
        coffee_regions(
          region:regions(*, translations:regions_translations(locale, region_name, description))
        ),
        coffee_flavor_notes(
          flavor_category:flavor_categories(
            *,
            translations:flavor_categories_translations(locale, name),
            parent:flavor_categories(
              *,
              translations:flavor_categories_translations(locale, name),
              parent:flavor_categories(
                *,
                translations:flavor_categories_translations(locale, name)
              )
            )
          )
        ),
        coffee_brew_methods(
          brew_method:brew_methods(
            *,
            translations:brew_methods_translations(locale, name)
          )
        ),
        coffee_processing_methods(
          processing_method:processing_methods(
            *,
            translations:processing_methods_translations(locale, name, description)
          )
        ),
        coffee_varietals(
          varietal:varietals(
            *,
            translations:varietals_translations(locale, name, description)
          )
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

    const translation = pickTranslation(data.translations, locale);
    
    const roastLevel = data.roast_level
      ? {
          ...data.roast_level,
          name: pickTranslation(data.roast_level.translations, locale)?.name || data.roast_level.name,
          description: pickTranslation(data.roast_level.translations, locale)?.description || null,
        }
      : null;

    const region = data.region
      ? {
          ...data.region,
          region_name: pickTranslation(data.region.translations, locale)?.region_name || data.region.region_name,
          description: pickTranslation(data.region.translations, locale)?.description ?? data.region.description,
        }
      : null;

    const coffee: Coffee = {
      ...data,
      name: translation?.name || data.name,
      short_description: translation?.short_description ?? data.short_description,
      description: translation?.description ?? data.description,
      roast_level_obj: roastLevel,
      region,
      regions:
        data.coffee_regions?.map((cr: any) => {
          const r = cr.region;
          if (!r) return null;
          const t = pickTranslation(r.translations, locale);
          return { ...r, region_name: t?.region_name || r.region_name, description: t?.description ?? r.description };
        }).filter(Boolean) || [],
      flavor_categories:
        data.coffee_flavor_notes?.map((cfn: any) => {
          const category = cfn.flavor_category;
          if (!category) return null;
          const t = pickTranslation(category.translations, locale);
          const localizedCategory = { ...category, name: t?.name || category.name };
          
          if (localizedCategory.parent) {
            const parentT = pickTranslation(localizedCategory.parent.translations, locale);
            localizedCategory.parent = {
              ...localizedCategory.parent,
              name: parentT?.name || localizedCategory.parent.name,
            };
            
            if (localizedCategory.parent.parent) {
              const grandParentT = pickTranslation(localizedCategory.parent.parent.translations, locale);
              localizedCategory.parent.parent = {
                ...localizedCategory.parent.parent,
                name: grandParentT?.name || localizedCategory.parent.parent.name,
              };
            }
          }
          
          return localizedCategory;
        }).filter(Boolean) || [],
      brew_methods:
        data.coffee_brew_methods?.map((cbm: any) => {
          const method = cbm.brew_method;
          if (!method) return null;
          const t = pickTranslation(method.translations, locale);
          return { ...method, name: t?.name || method.name };
        }).filter(Boolean) || [],
      processing_methods:
        data.coffee_processing_methods?.map((cpm: any) => {
          const method = cpm.processing_method;
          if (!method) return null;
          const t = pickTranslation(method.translations, locale);
          return { ...method, name: t?.name || method.name, description: t?.description ?? method.description };
        }).filter(Boolean) || [],
      varietals:
        data.coffee_varietals?.map((cv: any) => {
          const varietal = cv.varietal;
          if (!varietal) return null;
          const t = pickTranslation(varietal.translations, locale);
          return { ...varietal, name: t?.name || varietal.name, description: t?.description ?? varietal.description };
        }).filter(Boolean) || [],
      images: data.coffee_images || [],
    };

    coffee.roast_level_obj = roastLevel;

    const duration = Math.round(performance.now() - startTime);
    logger.query('coffees', 'selectById', duration, { id });

    return coffee;
  } catch (error) {
    logger.error('Failed to fetch coffee by id', error);
    throw error;
  }
}

export async function getFlavorWheel(locale = 'de'): Promise<FlavorWheelNode> {
  const startTime = performance.now();
  try {
    logger.debug('Fetching flavor wheel structure');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('flavor_categories')
      .select(`
        *,
        translations:flavor_categories_translations(locale, name)
      `)
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (categoriesError) {
      logger.error('Error fetching flavor categories', categoriesError);
      throw categoriesError;
    }

    const categoriesMap = new Map<string, FlavorCategory>();
    const categoriesByParent = new Map<string | null, FlavorCategory[]>();

    categories?.forEach((cat: any) => {
      const translation = pickTranslation(cat.translations, locale);
      const localized = { ...cat, name: translation?.name || cat.name };
      categoriesMap.set(cat.id, localized);
      const parentKey = cat.parent_id || null;
      if (!categoriesByParent.has(parentKey)) {
        categoriesByParent.set(parentKey, []);
      }
      categoriesByParent.get(parentKey)!.push(localized);
    });

    function buildNode(category: FlavorCategory): FlavorWheelNode {
      const children: FlavorWheelNode[] = [];
      
      const subCategories = categoriesByParent.get(category.id) || [];
      subCategories.forEach((subCat) => {
        children.push(buildNode(subCat));
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
      categories: categories?.length || 0
    });

    return rootNode;
  } catch (error) {
    logger.error('Failed to fetch flavor wheel', error);
    throw error;
  }
}

