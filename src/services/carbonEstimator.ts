import type { TablesInsert } from "@/integrations/supabase/types";
import type { OFFProduct } from "./openFoodFacts";
import {
  getProductName,
  getBrand,
  getOriginCountry,
  getPackagingMaterials,
  getImageUrl,
  isOrganic,
} from "./openFoodFacts";

// --- Emission factors (kg CO₂e per kg of food) ---
// Sources: Our World in Data, Poore & Nemecek 2018, IPCC
const CATEGORY_EMISSIONS: Record<string, number> = {
  beef: 27.0,
  lamb: 39.0,
  pork: 7.6,
  chicken: 6.9,
  turkey: 5.7,
  fish: 6.0,
  seafood: 11.9,
  shrimp: 18.0,
  salmon: 11.9,
  tuna: 6.1,
  eggs: 4.7,
  milk: 3.2,
  cheese: 13.5,
  yogurt: 2.5,
  butter: 11.5,
  cream: 5.6,
  "ice cream": 4.0,
  coffee: 5.0,
  tea: 1.2,
  chocolate: 4.6,
  cocoa: 4.6,
  rice: 4.0,
  pasta: 1.6,
  bread: 1.3,
  wheat: 1.4,
  oats: 1.0,
  corn: 1.2,
  sugar: 2.6,
  "palm oil": 7.6,
  "olive oil": 5.4,
  "soy oil": 2.0,
  soy: 2.0,
  tofu: 2.0,
  lentils: 0.9,
  beans: 0.8,
  chickpeas: 0.8,
  peas: 0.4,
  nuts: 2.3,
  peanuts: 2.5,
  almonds: 3.5,
  avocado: 2.5,
  tomato: 1.4,
  potato: 0.5,
  onion: 0.4,
  apple: 0.4,
  banana: 0.7,
  orange: 0.5,
  berries: 1.1,
  vegetables: 0.7,
  fruit: 0.7,
  juice: 1.5,
  soda: 0.8,
  water: 0.2,
  beer: 1.2,
  wine: 1.6,
  spirits: 2.7,
  snacks: 2.5,
  cereal: 1.8,
  "plant milk": 0.9,
  "oat milk": 0.9,
  "soy milk": 1.0,
  "almond milk": 1.2,
};

const DEFAULT_EMISSION = 2.5;

// --- Transport distance estimates by origin region (km from UK) ---
const REGION_DISTANCES: Record<string, { km: number; method: string }> = {
  "united kingdom": { km: 100, method: "road" },
  uk: { km: 100, method: "road" },
  ireland: { km: 400, method: "sea" },
  france: { km: 500, method: "road" },
  spain: { km: 1500, method: "road" },
  italy: { km: 1800, method: "road" },
  germany: { km: 900, method: "road" },
  netherlands: { km: 500, method: "sea" },
  belgium: { km: 400, method: "road" },
  poland: { km: 1600, method: "road" },
  greece: { km: 3000, method: "sea" },
  turkey: { km: 3200, method: "sea" },
  morocco: { km: 2500, method: "sea" },
  egypt: { km: 4000, method: "sea" },
  india: { km: 7500, method: "sea" },
  china: { km: 8500, method: "sea" },
  japan: { km: 9500, method: "sea" },
  thailand: { km: 9500, method: "sea" },
  vietnam: { km: 9600, method: "sea" },
  indonesia: { km: 11500, method: "sea" },
  "united states": { km: 7000, method: "sea" },
  usa: { km: 7000, method: "sea" },
  canada: { km: 5500, method: "sea" },
  mexico: { km: 8500, method: "sea" },
  brazil: { km: 9000, method: "sea" },
  argentina: { km: 11000, method: "sea" },
  colombia: { km: 8500, method: "sea" },
  peru: { km: 10200, method: "air" },
  chile: { km: 11600, method: "sea" },
  australia: { km: 15000, method: "sea" },
  "new zealand": { km: 18000, method: "sea" },
  "south africa": { km: 9600, method: "sea" },
  kenya: { km: 6800, method: "air" },
  ethiopia: { km: 5800, method: "air" },
  ghana: { km: 5000, method: "sea" },
  "ivory coast": { km: 5000, method: "sea" },
  sweden: { km: 1200, method: "sea" },
  norway: { km: 1500, method: "sea" },
  denmark: { km: 900, method: "sea" },
};

const DEFAULT_DISTANCE = { km: 5000, method: "sea" as const };

// Transport emission factors (kg CO₂ per tonne per km)
const TRANSPORT_FACTORS: Record<string, number> = {
  air: 0.602,
  road: 0.096,
  sea: 0.008,
  rail: 0.022,
  local: 0.05,
};

// Packaging emission estimates (kg CO₂ per unit)
const PACKAGING_EMISSIONS: Record<string, { co2: number; recyclable: boolean }> = {
  plastic: { co2: 0.18, recyclable: false },
  "plastic-bag": { co2: 0.10, recyclable: false },
  "plastic-tray": { co2: 0.20, recyclable: false },
  "plastic-bottle": { co2: 0.22, recyclable: true },
  glass: { co2: 0.35, recyclable: true },
  "glass-jar": { co2: 0.35, recyclable: true },
  "glass-bottle": { co2: 0.40, recyclable: true },
  cardboard: { co2: 0.08, recyclable: true },
  "cardboard-box": { co2: 0.10, recyclable: true },
  paper: { co2: 0.05, recyclable: true },
  "paper-bag": { co2: 0.06, recyclable: true },
  metal: { co2: 0.25, recyclable: true },
  "metal-can": { co2: 0.25, recyclable: true },
  aluminium: { co2: 0.30, recyclable: true },
  "tetra-pak": { co2: 0.12, recyclable: true },
  "tetra-brik": { co2: 0.12, recyclable: true },
  tin: { co2: 0.20, recyclable: true },
  film: { co2: 0.08, recyclable: false },
  "cling-film": { co2: 0.08, recyclable: false },
  polystyrene: { co2: 0.25, recyclable: false },
  hdpe: { co2: 0.18, recyclable: true },
  pet: { co2: 0.20, recyclable: true },
};

const DEFAULT_PACKAGING = { co2: 0.15, recyclable: false };

function matchCategory(tags: string[]): { category: string; co2PerKg: number } {
  const normalized = tags.map((t) =>
    t.replace("en:", "").replace(/-/g, " ").toLowerCase()
  );
  const joined = normalized.join(" ");

  const prioritized = [
    "beef", "lamb", "pork", "shrimp", "salmon", "tuna", "chicken", "turkey",
    "fish", "seafood", "cheese", "butter", "cream", "ice cream", "eggs",
    "milk", "yogurt", "chocolate", "cocoa", "coffee", "tea",
    "rice", "pasta", "bread", "wheat", "oats", "corn",
    "tofu", "soy", "lentils", "beans", "chickpeas", "peas",
    "almonds", "peanuts", "nuts", "avocado",
    "palm oil", "olive oil", "soy oil", "sugar",
    "oat milk", "soy milk", "almond milk", "plant milk",
    "beer", "wine", "spirits", "juice", "soda", "water",
    "tomato", "potato", "onion", "apple", "banana", "orange", "berries",
    "cereal", "snacks", "vegetables", "fruit",
  ];

  for (const key of prioritized) {
    if (joined.includes(key)) {
      return { category: key, co2PerKg: CATEGORY_EMISSIONS[key] };
    }
  }

  return { category: "other", co2PerKg: DEFAULT_EMISSION };
}

function mapToAppCategory(foodCategory: string): string {
  const mapping: Record<string, string> = {
    beef: "meat", lamb: "meat", pork: "meat", chicken: "meat", turkey: "meat",
    fish: "seafood", seafood: "seafood", salmon: "seafood", tuna: "seafood", shrimp: "seafood",
    milk: "dairy", cheese: "dairy", yogurt: "dairy", butter: "dairy", cream: "dairy",
    eggs: "dairy", "ice cream": "dairy",
    "oat milk": "dairy_alternative", "soy milk": "dairy_alternative",
    "almond milk": "dairy_alternative", "plant milk": "dairy_alternative",
    tofu: "protein", soy: "protein",
    lentils: "legumes", beans: "legumes", chickpeas: "legumes", peas: "legumes",
    rice: "grains", pasta: "grains", bread: "grains", wheat: "grains",
    oats: "grains", corn: "grains", cereal: "grains",
    avocado: "produce", tomato: "produce", potato: "produce", onion: "produce",
    apple: "produce", banana: "produce", orange: "produce", berries: "produce",
    vegetables: "produce", fruit: "produce",
    chocolate: "snacks", snacks: "snacks",
    peanuts: "spreads", almonds: "spreads", nuts: "spreads",
    coffee: "beverages", tea: "beverages", juice: "beverages",
    soda: "beverages", water: "beverages", beer: "beverages", wine: "beverages",
  };
  return mapping[foodCategory] || "other";
}

function resolveTransport(origin: string | null): {
  method: "air" | "sea" | "rail" | "road" | "local";
  km: number;
} {
  if (!origin) return { method: "sea", km: DEFAULT_DISTANCE.km };

  const normalized = origin.toLowerCase().trim();
  for (const [region, info] of Object.entries(REGION_DISTANCES)) {
    if (normalized.includes(region)) {
      return {
        method: info.method as "air" | "sea" | "rail" | "road" | "local",
        km: info.km,
      };
    }
  }
  return { method: "sea", km: DEFAULT_DISTANCE.km };
}

function resolvePackaging(tags: string[]): {
  material: string;
  recyclable: boolean;
  co2: number;
} {
  if (!tags.length) {
    return { material: "Unknown", recyclable: false, co2: DEFAULT_PACKAGING.co2 };
  }

  const normalized = tags.map((t) =>
    t.replace("en:", "").replace(/_/g, "-").toLowerCase()
  );

  let totalCo2 = 0;
  let anyRecyclable = false;
  const materials: string[] = [];

  for (const tag of normalized) {
    const match = PACKAGING_EMISSIONS[tag];
    if (match) {
      totalCo2 += match.co2;
      if (match.recyclable) anyRecyclable = true;
      materials.push(tag.replace(/-/g, " "));
    } else {
      for (const [key, val] of Object.entries(PACKAGING_EMISSIONS)) {
        if (tag.includes(key) || key.includes(tag)) {
          totalCo2 += val.co2;
          if (val.recyclable) anyRecyclable = true;
          materials.push(key.replace(/-/g, " "));
          break;
        }
      }
    }
  }

  if (totalCo2 === 0) {
    totalCo2 = DEFAULT_PACKAGING.co2;
  }

  return {
    material: materials.length ? materials.join(", ") : normalized.join(", "),
    recyclable: anyRecyclable,
    co2: totalCo2,
  };
}

export interface CarbonEstimate {
  totalCo2ePerKg: number;
  ingredientPct: number;
  transportPct: number;
  packagingPct: number;
  impactScore: number;
  foodCategory: string;
  appCategory: string;
  transportMethod: "air" | "sea" | "rail" | "road" | "local";
  transportDistanceKm: number;
  originCountry: string | null;
  packagingMaterial: string;
  packagingRecyclable: boolean;
  agriculturalPractice: string;
  waterUseLitersPerKg: number | null;
  landUseM2PerKg: number | null;
}

// Rough water/land use estimates by category
const WATER_USE: Record<string, number> = {
  beef: 15415, lamb: 10412, chicken: 4325, pork: 5988,
  cheese: 3178, milk: 1020, eggs: 3265,
  rice: 2500, wheat: 1827, chocolate: 17196,
  coffee: 18900, tea: 8860, almonds: 10240,
  avocado: 1981, tomato: 214, potato: 287,
  lentils: 1250, tofu: 2523,
};

const LAND_USE: Record<string, number> = {
  beef: 164, lamb: 185, chicken: 12.2, pork: 11,
  cheese: 87.8, milk: 8.9, eggs: 6.3,
  rice: 2.8, wheat: 3.6, chocolate: 20,
  coffee: 11.9, almonds: 2.5, avocado: 0.5,
  lentils: 7, tofu: 2.2,
};

export function estimateCarbon(product: OFFProduct): CarbonEstimate {
  const categoryTags = [
    ...(product.categories_tags || []),
    ...(product.categories ? [product.categories] : []),
    ...(product.ingredients_text ? [product.ingredients_text] : []),
  ];

  const { category: foodCategory, co2PerKg: ingredientCo2 } = matchCategory(categoryTags);
  const appCategory = mapToAppCategory(foodCategory);
  const origin = getOriginCountry(product);
  const transport = resolveTransport(origin);
  const packaging = resolvePackaging(getPackagingMaterials(product));

  // Transport CO₂: emission factor × distance (per tonne-km) converted to per kg
  const transportCo2 =
    (TRANSPORT_FACTORS[transport.method] || TRANSPORT_FACTORS.sea) *
    transport.km *
    0.001; // convert tonne-km to kg

  const packagingCo2 = packaging.co2;
  const totalCo2 = ingredientCo2 + transportCo2 + packagingCo2;

  const ingredientPct = Math.round((ingredientCo2 / totalCo2) * 100);
  const transportPct = Math.round((transportCo2 / totalCo2) * 100);
  const packagingPct = 100 - ingredientPct - transportPct;

  // Impact score: 1 (best) to 10 (worst), log-scaled
  // Anchor: 0.3 kg CO₂e → 1.0, 40 kg CO₂e → 10.0
  const clamped = Math.max(0.3, Math.min(totalCo2, 50));
  const impactScore = Math.round(
    (1 + (9 * (Math.log(clamped) - Math.log(0.3))) / (Math.log(50) - Math.log(0.3))) * 10
  ) / 10;

  const organic = isOrganic(product);

  return {
    totalCo2ePerKg: Math.round(totalCo2 * 100) / 100,
    ingredientPct,
    transportPct,
    packagingPct: Math.max(0, packagingPct),
    impactScore: Math.min(10, Math.max(1, impactScore)),
    foodCategory,
    appCategory,
    transportMethod: transport.method,
    transportDistanceKm: transport.km,
    originCountry: origin,
    packagingMaterial: packaging.material,
    packagingRecyclable: packaging.recyclable,
    agriculturalPractice: organic ? "organic" : "conventional",
    waterUseLitersPerKg: WATER_USE[foodCategory] ?? null,
    landUseM2PerKg: LAND_USE[foodCategory] ?? null,
  };
}

export function buildFoodProductRow(
  product: OFFProduct,
  estimate: CarbonEstimate
): TablesInsert<"food_products"> {
  return {
    barcode: product.code,
    name: getProductName(product),
    brand: getBrand(product),
    category: estimate.appCategory,
    image_url: getImageUrl(product),
    total_co2e_per_kg: estimate.totalCo2ePerKg,
    ingredient_co2e_pct: estimate.ingredientPct,
    transport_co2e_pct: estimate.transportPct,
    packaging_co2e_pct: estimate.packagingPct,
    impact_score: estimate.impactScore,
    transport_method: estimate.transportMethod,
    transport_distance_km: estimate.transportDistanceKm,
    origin_country: estimate.originCountry,
    packaging_material: estimate.packagingMaterial,
    packaging_recyclable: estimate.packagingRecyclable,
    agricultural_practice: estimate.agriculturalPractice as
      | "conventional"
      | "organic"
      | "regenerative"
      | "hydroponic"
      | "free_range"
      | "factory_farmed",
    water_use_liters_per_kg: estimate.waterUseLitersPerKg,
    land_use_m2_per_kg: estimate.landUseM2PerKg,
  };
}
