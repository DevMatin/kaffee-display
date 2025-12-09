export interface Region {
  id: string;
  country: string;
  region_name: string;
  latitude: number | null;
  longitude: number | null;
  emblem_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlavorNote {
  id: string;
  name: string;
  icon_url: string | null;
  description: string | null;
  category_id?: string | null;
  color_hex?: string | null;
  category?: FlavorCategory | null;
}

export interface BrewMethod {
  id: string;
  name: string;
  icon_url: string | null;
}

export interface ProcessingMethod {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Varietal {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoffeeImage {
  id: string;
  coffee_id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
}

export interface Coffee {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  roast_level: string | null;
  processing_method: string | null;
  varietal: string | null;
  altitude_min: number | null;
  altitude_max: number | null;
  country: string | null;
  region_id: string | null;
  image_url: string | null;
  // Commerce fields
  sku?: string | null;
  regular_price?: number | null;
  sale_price?: number | null;
  currency?: string | null;
  stock_status?: string | null;
  manage_stock?: boolean | null;
  stock_quantity?: number | null;
  product_url?: string | null;
  external_id?: string | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at: string;
  region?: Region | null;
  regions?: Region[];
  flavor_notes?: FlavorNote[];
  brew_methods?: BrewMethod[];
  processing_methods?: ProcessingMethod[];
  varietals?: Varietal[];
  images?: CoffeeImage[];
}

export interface CoffeeRegion {
  id: string;
  coffee_id: string;
  region_id: string;
  created_at: string;
  region?: Region | null;
}

export interface CoffeeFlavorNote {
  id: string;
  coffee_id: string;
  flavor_id: string;
}

export interface CoffeeBrewMethod {
  id: string;
  coffee_id: string;
  brew_id: string;
}

export interface CoffeeProcessingMethod {
  id: string;
  coffee_id: string;
  processing_method_id: string;
}

export interface CoffeeVarietal {
  id: string;
  coffee_id: string;
  varietal_id: string;
}

export interface FlavorCategory {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  color_hex: string | null;
  created_at: string;
  parent?: FlavorCategory | null;
}

export interface FlavorWheelNode {
  name: string;
  label?: string;
  level?: number;
  color?: string;
  id?: string;
  value?: number;
  labelVisible?: boolean;
  children?: FlavorWheelNode[];
}


