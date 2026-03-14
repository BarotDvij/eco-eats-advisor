import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { lookupBarcode } from "./openFoodFacts";
import { estimateCarbon, buildFoodProductRow } from "./carbonEstimator";

export type LookupResult =
  | { status: "found"; product: Tables<"food_products">; source: "cache" | "openfoodfacts" }
  | { status: "not_found" }
  | { status: "error"; message: string };

export async function lookupAndEstimate(barcode: string): Promise<LookupResult> {
  const cleaned = barcode.replace(/\s+/g, "").trim();
  if (!cleaned) {
    return { status: "error", message: "Empty barcode" };
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
