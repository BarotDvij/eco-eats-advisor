import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { OFFProduct } from "./openFoodFacts";
import { estimateCarbon, buildFoodProductRow } from "./carbonEstimator";
import { matchDemoFromAI } from "./demoProducts";

/**
 * Expected shape from the Gemini/n8n AI pipeline.
 * This is flexible — we extract whatever fields are present.
 */
export interface AIFoodResult {
  food?: string;
  name?: string;
  product_name?: string;
  category?: string;
  categories?: string[];
  ingredients?: string[];
  ingredients_text?: string;
  brand?: string;
  origin?: string;
  origin_country?: string;
  packaging?: string;
  barcode?: string;
  confidence?: number;
}

function normalizeAIResult(raw: unknown): AIFoodResult {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;

  // Handle both direct fields and nested "data" from the edge function
  const data =
    typeof obj.data === "object" && obj.data !== null
      ? (obj.data as Record<string, unknown>)
      : obj;

  return {
    food: asString(data.food),
    name: asString(data.name),
    product_name: asString(data.product_name),
    category: asString(data.category),
    categories: asStringArray(data.categories),
    ingredients: asStringArray(data.ingredients),
    ingredients_text: asString(data.ingredients_text),
    brand: asString(data.brand),
    origin: asString(data.origin) || asString(data.origin_country),
    packaging: asString(data.packaging),
    barcode: asString(data.barcode),
    confidence: typeof data.confidence === "number" ? data.confidence : undefined,
  };
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.filter((s) => typeof s === "string");
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return undefined;
}

/**
 * Takes the raw AI response, converts it into an OFFProduct-like structure,
 * runs the carbon estimator, upserts to Supabase, and returns a food_products row.
 */
export async function estimateFromAIResult(
  raw: unknown
): Promise<Tables<"food_products"> | null> {
  // Skip demo matching — use real AI results only

  const ai = normalizeAIResult(raw);
  const foodName = ai.food || ai.name || ai.product_name;
  if (!foodName) return null;

  // Build a synthetic OFFProduct from the AI data so the carbon estimator can process it
  const syntheticProduct: OFFProduct = {
    code: ai.barcode || `ai-${Date.now()}`,
    product_name: foodName,
    brands: ai.brand,
    categories_tags: ai.categories || (ai.category ? [`en:${ai.category}`] : []),
    categories: ai.category || foodName,
    origins: ai.origin,
    packaging_tags: ai.packaging ? [ai.packaging] : [],
    ingredients_text:
      ai.ingredients_text || ai.ingredients?.join(", ") || foodName,
  };

  const estimate = estimateCarbon(syntheticProduct);
  const row = buildFoodProductRow(syntheticProduct, estimate);

  // Try to upsert if we have a real barcode, otherwise just insert
  if (ai.barcode) {
    const { data: inserted, error } = await supabase
      .from("food_products")
      .upsert(row, { onConflict: "barcode" })
      .select("*")
      .single();

    if (!error && inserted) return inserted;
  }

  // Insert without barcode constraint
  const { data: inserted, error } = await supabase
    .from("food_products")
    .insert({ ...row, barcode: null })
    .select("*")
    .single();

  if (!error && inserted) return inserted;

  // Return a local-only product if DB insert fails
  return {
    id: crypto.randomUUID(),
    ...row,
    barcode: ai.barcode || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Tables<"food_products">;
}
