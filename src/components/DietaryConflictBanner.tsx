import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useDietaryPreferences, DIETARY_CATEGORIES } from "@/hooks/use-dietary-preferences";
import type { Tables } from "@/integrations/supabase/types";

/** Maps dietary preference IDs to keywords that indicate a conflict in product name/category */
const CONFLICT_KEYWORDS: Record<string, string[]> = {
  // Dietary preferences
  vegetarian: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "bacon", "sausage", "salami", "ham", "pepperoni"],
  vegan: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "bacon", "sausage", "salami", "ham", "pepperoni", "milk", "dairy", "cheese", "butter", "cream", "egg", "honey", "yogurt", "whey", "casein", "gelatin"],
  pescatarian: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "bacon", "sausage", "salami", "ham", "pepperoni"],
  "plant-based": ["meat", "beef", "pork", "chicken", "turkey", "lamb", "milk", "dairy", "cheese", "butter", "cream", "egg", "whey", "casein"],

  // Allergies
  peanuts: ["peanut"],
  "tree-nuts": ["almond", "walnut", "cashew", "hazelnut", "pistachio", "pecan", "macadamia", "brazil nut"],
  dairy: ["milk", "dairy", "cheese", "butter", "cream", "yogurt", "whey", "casein", "lactose"],
  eggs: ["egg"],
  soy: ["soy", "soya", "tofu", "edamame"],
  gluten: ["wheat", "gluten", "barley", "rye", "spelt"],
  fish: ["fish", "salmon", "tuna", "cod", "anchov"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster", "scallop"],
  sesame: ["sesame", "tahini"],

  // Health diets
  "gluten-free": ["wheat", "gluten", "barley", "rye", "spelt"],
  "dairy-free": ["milk", "dairy", "cheese", "butter", "cream", "yogurt", "whey", "casein", "lactose"],

  // Eco
  "low-carbon": [],
  "locally-sourced": [],
  organic: [],
};

export interface DietaryConflict {
  preferenceId: string;
  preferenceLabel: string;
  preferenceEmoji: string;
  matchedKeyword: string;
}

export function detectConflicts(product: Tables<"food_products">, selectedPrefs: string[]): DietaryConflict[] {
  if (selectedPrefs.length === 0) return [];

  const searchText = `${product.name} ${product.category} ${product.brand ?? ""}`.toLowerCase();
  const allItems = DIETARY_CATEGORIES.flatMap((c) => c.items);
  const conflicts: DietaryConflict[] = [];

  for (const prefId of selectedPrefs) {
    const keywords = CONFLICT_KEYWORDS[prefId];
    if (!keywords || keywords.length === 0) continue;

    for (const kw of keywords) {
      if (searchText.includes(kw)) {
        const item = allItems.find((i) => i.id === prefId);
        if (item) {
          conflicts.push({
            preferenceId: prefId,
            preferenceLabel: item.label,
            preferenceEmoji: item.emoji,
            matchedKeyword: kw,
          });
        }
        break; // one match per preference is enough
      }
    }
  }

  return conflicts;
}

interface DietaryConflictBannerProps {
  product: Tables<"food_products">;
}

const DietaryConflictBanner = ({ product }: DietaryConflictBannerProps) => {
  const { selected } = useDietaryPreferences();
  const conflicts = detectConflicts(product, selected);

  if (conflicts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">
            Dietary conflict{conflicts.length > 1 ? "s" : ""} detected
          </p>
          <ul className="space-y-0.5">
            {conflicts.map((c) => (
              <li key={c.preferenceId} className="text-xs text-destructive/80">
                {c.preferenceEmoji} Conflicts with your <span className="font-medium">{c.preferenceLabel}</span> preference
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default DietaryConflictBanner;
