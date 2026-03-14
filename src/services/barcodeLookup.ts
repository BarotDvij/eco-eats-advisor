import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { lookupBarcode } from "./openFoodFacts";
import { estimateCarbon, buildFoodProductRow } from "./carbonEstimator";

export type LookupResult =
  | { status: "found"; product: Tables<"food_products">; source: "cache" | "openfoodfacts" | "demo" }
  | { status: "not_found" }
  | { status: "error"; message: string };

// Demo products with curated data for presentation reliability
const DEMO_PRODUCTS: Record<string, Tables<"food_products">> = {
  "055000132152": {
    id: "demo-nescafe-rich",
    barcode: "055000132152",
    name: "Nescafé Rich Instant Coffee 475g",
    brand: "Nescafé",
    category: "beverages",
    image_url: null,
    total_co2e_per_kg: 5.2,
    ingredient_co2e_pct: 72,
    transport_co2e_pct: 18,
    packaging_co2e_pct: 10,
    impact_score: 5.6,
    agricultural_practice: "conventional",
    transport_method: "sea",
    transport_distance_km: 8500,
    origin_country: "Brazil",
    packaging_material: "Plastic jar, foil seal",
    packaging_recyclable: true,
    water_use_liters_per_kg: 18900,
    land_use_m2_per_kg: 11.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

function matchDemoBarcode(barcode: string): Tables<"food_products"> | null {
  // Check with and without leading zeros
  return DEMO_PRODUCTS[barcode]
    || DEMO_PRODUCTS[barcode.replace(/^0+/, "")]
    || DEMO_PRODUCTS["0" + barcode]
    || null;
}

export async function lookupAndEstimate(barcode: string): Promise<LookupResult> {
  const cleaned = barcode.replace(/\s+/g, "").trim();
  if (!cleaned) {
    return { status: "error", message: "Empty barcode" };
  }

  // 0. Check demo products first (guaranteed to work for presentations)
  const demo = matchDemoBarcode(cleaned);
  if (demo) {
    return { status: "found", product: demo, source: "demo" };
  }

  try {
    // 1. Check if we already have this product in Supabase
    const { data: cached } = await supabase
      .from("food_products")
      .select("*")
      .eq("barcode", cleaned)
      .maybeSingle();

    if (cached) {
      return { status: "found", product: cached, source: "cache" };
    }

    // 2. Look up on Open Food Facts
    const offProduct = await lookupBarcode(cleaned);
    if (!offProduct) {
      return { status: "not_found" };
    }

    // 3. Estimate carbon footprint
    const estimate = estimateCarbon(offProduct);
    const row = buildFoodProductRow(offProduct, estimate);

    // 4. Insert into Supabase so it's cached for next time & shows in search/alternatives
    const { data: inserted, error } = await supabase
      .from("food_products")
      .upsert(row, { onConflict: "barcode" })
      .select("*")
      .single();

    if (error || !inserted) {
      // Still return the estimate even if DB insert fails
      console.error("Supabase upsert failed:", error);
      return {
        status: "found",
        product: {
          id: crypto.randomUUID(),
          ...row,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Tables<"food_products">,
        source: "openfoodfacts",
      };
    }

    return { status: "found", product: inserted, source: "openfoodfacts" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Barcode lookup failed:", err);
    return { status: "error", message };
  }
}
