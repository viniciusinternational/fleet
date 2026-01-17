/**
 * Vehicle Constants Module
 * Fetches vehicle-related constants from the database via API
 * Falls back to empty arrays if API is unavailable
 */

// Cache for API responses
let makesCache: any[] | null = null;
let modelsCache: any[] | null = null;
let colorsCache: any[] | null = null;
let transmissionsCache: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to fetch from API with caching
async function fetchFromAPI(endpoint: string, cacheKey: string): Promise<any[]> {
  const now = Date.now();
  
  // Return cached data if available and fresh
  if (cacheKey === 'makes' && makesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return makesCache;
  }
  if (cacheKey === 'models' && modelsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return modelsCache;
  }
  if (cacheKey === 'colors' && colorsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return colorsCache;
  }
  if (cacheKey === 'transmissions' && transmissionsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return transmissionsCache;
  }

  try {
    const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/settings/${endpoint}?includeInactive=false`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        // Update cache
        if (cacheKey === 'makes') makesCache = result.data;
        if (cacheKey === 'models') modelsCache = result.data;
        if (cacheKey === 'colors') colorsCache = result.data;
        if (cacheKey === 'transmissions') transmissionsCache = result.data;
        cacheTimestamp = now;
        return result.data;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint} from API:`, error);
  }

  // Return cached data even if stale, or empty array
  if (cacheKey === 'makes' && makesCache) return makesCache;
  if (cacheKey === 'models' && modelsCache) return modelsCache;
  if (cacheKey === 'colors' && colorsCache) return colorsCache;
  if (cacheKey === 'transmissions' && transmissionsCache) return transmissionsCache;
  
  return [];
}

// Clear cache (useful after mutations)
export function clearConstantsCache() {
  makesCache = null;
  modelsCache = null;
  colorsCache = null;
  transmissionsCache = null;
  cacheTimestamp = 0;
}

// Vehicle Makes - Fetch from API
export async function getVehicleMakes(): Promise<string[]> {
  const makes = await fetchFromAPI('makes', 'makes');
  return makes.map((make: any) => make.name).filter(Boolean);
}

// For backward compatibility, export as array (will be populated on first use)
export let VEHICLE_MAKES: readonly string[] = [] as any;

// Initialize makes on module load (client-side only)
if (typeof window !== 'undefined') {
  getVehicleMakes().then(makes => {
    VEHICLE_MAKES = makes as any;
  });
}

export type VehicleMake = string;

// Vehicle Models - Fetch from API
export async function getVehicleModels(): Promise<Record<string, readonly string[]>> {
  const models = await fetchFromAPI('models', 'models');
  const modelsByMake: Record<string, string[]> = {};
  
  models.forEach((model: any) => {
    const makeName = model.make?.name || '';
    if (makeName && !modelsByMake[makeName]) {
      modelsByMake[makeName] = [];
    }
    if (makeName && model.name) {
      modelsByMake[makeName].push(model.name);
    }
  });

  // Convert to readonly arrays
  const result: Record<string, readonly string[]> = {};
  Object.keys(modelsByMake).forEach(make => {
    result[make] = modelsByMake[make] as readonly string[];
  });

  return result;
}

// For backward compatibility
export let VEHICLE_MODELS: Record<VehicleMake, readonly string[]> = {} as any;

// Initialize models on module load (client-side only)
if (typeof window !== 'undefined') {
  getVehicleModels().then(models => {
    VEHICLE_MODELS = models as any;
  });
}

// Vehicle Colors - Fetch from API
export async function getVehicleColors(): Promise<string[]> {
  const colors = await fetchFromAPI('colors', 'colors');
  return colors.map((color: any) => color.name).filter(Boolean);
}

// For backward compatibility
export let VEHICLE_COLORS: readonly string[] = [] as any;

// Initialize colors on module load (client-side only)
if (typeof window !== 'undefined') {
  getVehicleColors().then(colors => {
    VEHICLE_COLORS = colors as any;
  });
}

export type VehicleColor = string;

// Transmission Types - Fetch from API
export async function getTransmissionTypes(): Promise<string[]> {
  const transmissions = await fetchFromAPI('transmissions', 'transmissions');
  return transmissions.map((t: any) => t.name).filter(Boolean);
}

// For backward compatibility
export let TRANSMISSION_TYPES: readonly string[] = [] as any;

// Initialize transmissions on module load (client-side only)
if (typeof window !== 'undefined') {
  getTransmissionTypes().then(types => {
    TRANSMISSION_TYPES = types as any;
  });
}

export type TransmissionType = string;

// Transmission Type Mapping - Fetch from API
export async function getTransmissionEnumMap(): Promise<Record<string, string>> {
  const transmissions = await fetchFromAPI('transmissions', 'transmissions');
  const map: Record<string, string> = {};
  transmissions.forEach((t: any) => {
    map[t.name] = t.enumValue;
  });
  return map;
}

export let TRANSMISSION_ENUM_MAP: Record<string, string> = {};

// Initialize enum map on module load (client-side only)
if (typeof window !== 'undefined') {
  getTransmissionEnumMap().then(map => {
    TRANSMISSION_ENUM_MAP = map;
  });
}

// Transmission Enum to Display Name Mapping - Fetch from API
export async function getTransmissionDisplayMap(): Promise<Record<string, string>> {
  const transmissions = await fetchFromAPI('transmissions', 'transmissions');
  const map: Record<string, string> = {};
  transmissions.forEach((t: any) => {
    map[t.enumValue] = t.name;
  });
  return map;
}

export let TRANSMISSION_DISPLAY_MAP: Record<string, string> = {};

// Initialize display map on module load (client-side only)
if (typeof window !== 'undefined') {
  getTransmissionDisplayMap().then(map => {
    TRANSMISSION_DISPLAY_MAP = map;
  });
}

// Fuel Types (still using enum - not moved to database yet)
export const FUEL_TYPES = [
  'Gasoline',
  'Diesel',
  'Electric',
  'Hybrid',
] as const;

export type FuelType = typeof FUEL_TYPES[number];

// Fuel Type Mapping (Display Name -> Enum Value)
export const FUEL_TYPE_ENUM_MAP: Record<FuelType, string> = {
  'Gasoline': 'GASOLINE',
  'Diesel': 'DIESEL',
  'Electric': 'ELECTRIC',
  'Hybrid': 'HYBRID',
} as const;

// Helper function to get models for a specific make
export async function getModelsForMake(make: VehicleMake): Promise<readonly string[]> {
  const models = await getVehicleModels();
  return models[make] || [];
}

// Synchronous version for backward compatibility (uses cached data)
export function getModelsForMakeSync(make: VehicleMake): readonly string[] {
  return VEHICLE_MODELS[make] || [];
}

// Helper function to check if a model belongs to a make
export async function isModelValidForMake(make: VehicleMake, model: string): Promise<boolean> {
  const models = await getModelsForMake(make);
  return models.includes(model as any);
}

// Synchronous version for backward compatibility
export function isModelValidForMakeSync(make: VehicleMake, model: string): boolean {
  const models = getModelsForMakeSync(make);
  return models.includes(model as any);
}
