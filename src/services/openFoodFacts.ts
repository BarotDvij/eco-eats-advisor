const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";

const RELEVANT_FIELDS = [
  "product_name",
  "brands",
  "categories_tags",
  "categories",
  "origins",
  "origins_tags",
  "packaging_tags",
  "packaging_text",
  "ingredients_text",
  "image_url",
  "image_front_url",
  "ecoscore_grade",
  "ecoscore_score",
  "labels_tags",
  "manufacturing_places",
  "countries_tags",
  "code",
].join(",");

export interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  categories_tags?: string[];
  categories?: string;
  origins?: string;
  origins_tags?: string[];
  packaging_tags?: string[];
  packaging_text?: string;
  ingredients_text?: string;
  image_url?: string;
  image_front_url?: string;
  ecoscore_grade?: string;
  ecoscore_score?: number;
  labels_tags?: string[];
  manufacturing_places?: string;
  countries_tags?: string[];
}

export interface OFFResponse {
  code: string;
  product?: OFFProduct;
  status: number;
  status_verbose: string;
}

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  const cleaned = barcode.replace(/\s+/g, "").trim();
  if (!cleaned) return null;

  const url = `${OFF_API_BASE}/product/${encodeURIComponent(cleaned)}?fields=${RELEVANT_FIELDS}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Bloom-EcoEats/1.0 (designathon MVP)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts API error: ${response.status}`);
  }

  const data: OFFResponse = await response.json();

  if (data.status === 0 || !data.product) {
    return null;
  }

  return { ...data.product, code: data.code };
}

export function getProductName(product: OFFProduct): string {
  return product.product_name || `Product ${product.code}`;
}

export function getBrand(product: OFFProduct): string | null {
  return product.brands?.split(",")[0]?.trim() || null;
}

export function getOriginCountry(product: OFFProduct): string | null {
  if (product.origins) {
    return product.origins.split(",")[0]?.trim() || null;
  }
  if (product.origins_tags?.length) {
    return product.origins_tags[0].replace("en:", "").replace(/-/g, " ");
  }
  if (product.manufacturing_places) {
    return product.manufacturing_places.split(",")[0]?.trim() || null;
  }
  return null;
}

export function getPackagingMaterials(product: OFFProduct): string[] {
  if (product.packaging_tags?.length) {
    return product.packaging_tags
      .map((tag) => tag.replace("en:", ""))
      .slice(0, 5);
  }
  if (product.packaging_text) {
    return [product.packaging_text];
  }
  return [];
}

export function getImageUrl(product: OFFProduct): string | null {
  return product.image_front_url || product.image_url || null;
}

export function isOrganic(product: OFFProduct): boolean {
  return (
    product.labels_tags?.some(
      (tag) => tag.includes("organic") || tag.includes("bio")
    ) ?? false
  );
}
