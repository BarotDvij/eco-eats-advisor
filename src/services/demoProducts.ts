/**
 * ============================================================
 *  DEMO-ONLY DATA — for Bloom Designathon presentation
 * ============================================================
 *
 *  These hardcoded products bypass the Open Food Facts API and
 *  the carbon estimator so the on-stage demo works instantly
 *  and reliably regardless of network conditions.
 *
 *  Remove this file (and its import in barcodeLookup.ts)
 *  once real API/estimation is sufficient.
 * ============================================================
 */

import type { Tables } from "@/integrations/supabase/types";

// The actual product used on stage: Nescafé Rich 170g glass jar
const NESCAFE_RICH: Tables<"food_products"> = {
  id: "demo-nescafe-rich",
  barcode: "055000008815",
  name: "Nescafé Rich Instant Coffee 170g",
  brand: "Nescafé",
  category: "beverages",
  image_url: null,
  total_co2e_per_kg: 5.2,
  ingredient_co2e_pct: 68,
  transport_co2e_pct: 17,
  packaging_co2e_pct: 15,
  impact_score: 5.6,
  agricultural_practice: "conventional",
  transport_method: "sea",
  transport_distance_km: 8500,
  origin_country: "Brazil",
  packaging_material: "Glass jar, plastic lid, foil seal",
  packaging_recyclable: true,
  water_use_liters_per_kg: 18900,
  land_use_m2_per_kg: 11.9,
  // Nutrition fields (null for demo product)
  calories_per_100g: null,
  carbs_g: null,
  fat_g: null,
  fiber_g: null,
  protein_g: null,
  sodium_mg: null,
  sugar_g: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Barcode lookup: maps barcode strings → demo product
export const DEMO_BARCODES: Record<string, Tables<"food_products">> = {
  "055000008815": NESCAFE_RICH,   // 170g jar (the one we have on stage)
  "55000008815": NESCAFE_RICH,    // without leading zero
  "055000132152": NESCAFE_RICH,   // 475g tin (same product, different size)
};

/**
 * Check if a barcode matches a demo product.
 */
export function matchDemoBarcode(barcode: string): Tables<"food_products"> | null {
  return DEMO_BARCODES[barcode] || null;
}
