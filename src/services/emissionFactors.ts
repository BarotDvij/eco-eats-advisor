import { supabase } from "@/integrations/supabase/client";

/**
 * Emission factor data, backed by the `emission_factors` Supabase table
 * (real Agribalyse 3.1 / Poore & Nemecek values) with an in-memory cache
 * and a hardcoded offline fallback so the app never breaks during a demo.
 */

export interface EmissionFactor {
  category: string;
  co2ePerKg: number;
  agriculturePct: number;
  processingPct: number;
  packagingPct: number;
  transportPct: number;
  waterUseLitersPerKg: number | null;
  landUseM2PerKg: number | null;
  source: string;
}

// Hardcoded fallback — used only if the Supabase fetch fails (offline / demo)
const FALLBACK_FACTORS: Record<string, number> = {
  beef: 28.7, lamb: 39.2, pork: 7.2, chicken: 5.7, turkey: 5.5,
  fish: 5.1, seafood: 11.5, salmon: 11.9, tuna: 6.1, shrimp: 18.0,
  eggs: 4.5, milk: 3.15, cheese: 13.5, yogurt: 2.5, butter: 11.5,
  cream: 5.6, "ice cream": 4.0, coffee: 16.5, tea: 6.3, juice: 1.5,
  soda: 0.8, water: 0.3, beer: 1.1, wine: 1.6, spirits: 2.7,
  chocolate: 18.7, cocoa: 18.7, sugar: 2.6, snacks: 2.5,
  rice: 4.0, pasta: 1.6, bread: 1.3, wheat: 1.4, oats: 1.0,
  corn: 1.2, cereal: 1.8, tofu: 2.0, soy: 1.7, lentils: 0.9,
  beans: 0.8, chickpeas: 0.8, peas: 0.4, nuts: 2.3, peanuts: 2.5,
  almonds: 3.5, "oat milk": 0.9, "soy milk": 1.0, "almond milk": 1.2,
  "plant milk": 1.0, avocado: 2.5, tomato: 1.4, potato: 0.5,
  onion: 0.4, apple: 0.4, banana: 0.7, orange: 0.5, berries: 1.1,
  vegetables: 0.7, fruit: 0.7, "palm oil": 7.6, "olive oil": 5.4,
  "soy oil": 2.0,
};

const DEFAULT_CO2E = 2.5;

let cache: Map<string, EmissionFactor> | null = null;
let loadPromise: Promise<void> | null = null;

interface EmissionFactorRow {
  category: string;
  co2e_per_kg: number;
  agriculture_pct: number;
  processing_pct: number;
  packaging_pct: number;
  transport_pct: number;
  water_use_liters_per_kg: number | null;
  land_use_m2_per_kg: number | null;
  source: string;
}

async function loadFactors(): Promise<void> {
  try {
    // The emission_factors table isn't in the generated Supabase types yet,
    // so we query it with a loose cast. Regenerate types to remove this.
    const { data, error } = await (supabase as any)
      .from("emission_factors")
      .select("*");

    if (error || !data) {
      console.warn("emission_factors fetch failed, using fallback:", error);
      cache = new Map();
      return;
    }

    const map = new Map<string, EmissionFactor>();
    for (const row of data as EmissionFactorRow[]) {
      map.set(row.category, {
        category: row.category,
        co2ePerKg: Number(row.co2e_per_kg),
        agriculturePct: Number(row.agriculture_pct),
        processingPct: Number(row.processing_pct),
        packagingPct: Number(row.packaging_pct),
        transportPct: Number(row.transport_pct),
        waterUseLitersPerKg: row.water_use_liters_per_kg != null ? Number(row.water_use_liters_per_kg) : null,
        landUseM2PerKg: row.land_use_m2_per_kg != null ? Number(row.land_use_m2_per_kg) : null,
        source: row.source,
      });
    }
    cache = map;
  } catch (err) {
    console.warn("emission_factors load error, using fallback:", err);
    cache = new Map();
  }
}

/**
 * Ensure the emission factor cache is loaded. Safe to call repeatedly —
 * the network fetch only happens once.
 */
export async function ensureFactorsLoaded(): Promise<void> {
  if (cache) return;
  if (!loadPromise) {
    loadPromise = loadFactors();
  }
  await loadPromise;
}

/**
 * Get the emission factor for a category. Returns the real DB-backed value
 * if available, otherwise the hardcoded fallback, otherwise the default.
 */
export function getEmissionFactor(category: string): EmissionFactor {
  const fromDb = cache?.get(category);
  if (fromDb) return fromDb;

  const fallbackCo2e = FALLBACK_FACTORS[category] ?? DEFAULT_CO2E;
  return {
    category,
    co2ePerKg: fallbackCo2e,
    agriculturePct: 70,
    processingPct: 12,
    packagingPct: 10,
    transportPct: 8,
    waterUseLitersPerKg: null,
    landUseM2PerKg: null,
    source: "fallback",
  };
}
