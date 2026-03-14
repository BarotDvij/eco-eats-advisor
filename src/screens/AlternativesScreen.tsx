import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import AlternativeCard from "../components/AlternativeCard";

const quickFilters = [
  { id: "low-carbon", label: "Low CO₂", icon: "🦶" },
  { id: "local", label: "Local Only", icon: "📍" },
  { id: "organic", label: "Organic", icon: "🌿" },
];

const categoryEmoji: Record<string, string> = {
  meat: "🥩", dairy: "🥛", dairy_alternative: "🥛", produce: "🥑",
  spreads: "🥜", protein: "🌱", seafood: "🐟", legumes: "🫘",
  grains: "🌾", snacks: "🍫",
};

const veganCategories = ["produce", "dairy_alternative", "legumes", "grains", "protein"];
const vegetarianExclude = ["meat", "seafood"];
const pescatarianExclude = ["meat"];

interface AlternativesScreenProps {
  product: Tables<"food_products">;
  onBack: () => void;
  onSelectProduct: (product: Tables<"food_products">) => void;
}

const AlternativesScreen = ({ product, onBack, onSelectProduct }: AlternativesScreenProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<Tables<"food_products">[]>([]);
  const { isSelected } = useDietaryPreferences();

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    supabase
      .from("food_products")
      .select("*")
      .lt("impact_score", product.impact_score)
      .neq("id", product.id)
      .order("impact_score", { ascending: true })
      .limit(10)
      .then(({ data }) => {
        if (data) setAlternatives(data);
      });
  }, [product]);

  const filtered = alternatives.filter((alt) => {
    const name = alt.name.toLowerCase();

    // Dietary preferences from settings
    if (isSelected("vegan") && !veganCategories.includes(alt.category)) return false;
    if (isSelected("vegetarian") && vegetarianExclude.includes(alt.category)) return false;
    if (isSelected("pescatarian") && pescatarianExclude.includes(alt.category)) return false;
    if (isSelected("plant-based") && !veganCategories.includes(alt.category)) return false;

    // Allergies from settings
    if (isSelected("peanuts") && name.includes("peanut")) return false;
    if (isSelected("tree-nuts") && (name.includes("almond") || name.includes("cashew") || name.includes("walnut"))) return false;
    if (isSelected("dairy") && alt.category === "dairy") return false;
    if (isSelected("gluten") && (name.includes("wheat") || name.includes("bread") || name.includes("pasta"))) return false;
    if (isSelected("soy") && (name.includes("soy") || name.includes("tofu") || name.includes("edamame"))) return false;
    if (isSelected("fish") && alt.category === "seafood") return false;
    if (isSelected("shellfish") && (name.includes("shrimp") || name.includes("crab") || name.includes("lobster"))) return false;
    if (isSelected("eggs") && name.includes("egg")) return false;
    if (isSelected("sesame") && name.includes("sesame")) return false;

    // Health diets
    if (isSelected("dairy-free") && alt.category === "dairy") return false;
    if (isSelected("gluten-free") && (name.includes("wheat") || name.includes("bread") || name.includes("pasta"))) return false;

    // Eco filters from settings
    if (isSelected("locally-sourced") && alt.transport_method !== "local" && alt.transport_method !== "road") return false;
    if (isSelected("organic") && alt.agricultural_practice !== "organic" && alt.agricultural_practice !== "regenerative") return false;
    if (isSelected("minimal-packaging") && alt.packaging_recyclable !== true) return false;

    // Quick filters (toggle buttons on this screen)
    if (activeFilters.includes("low-carbon") && alt.total_co2e_per_kg > 2) return false;
    if (activeFilters.includes("local") && alt.transport_method !== "local" && alt.transport_method !== "road") return false;
    if (activeFilters.includes("organic") && alt.agricultural_practice !== "organic" && alt.agricultural_practice !== "regenerative") return false;

    return true;
  });

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div>
          <div className="label-caps text-muted-foreground">Alternatives for</div>
          <h1 className="text-base font-medium tracking-tight">{product.name}</h1>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {quickFilters.map((f) => {
          const active = activeFilters.includes(f.id);
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleFilter(f.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border shadow-card"
              }`}
            >
              <span>{f.icon}</span> {f.label}
            </motion.button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((alt, i) => {
          const savings = Math.round(
            ((product.total_co2e_per_kg - alt.total_co2e_per_kg) / product.total_co2e_per_kg) * 100
          );
          return (
            <motion.div
              key={alt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelectProduct(alt)}
              className="cursor-pointer"
            >
              <AlternativeCard
                currentName={product.name}
                currentCo2={product.total_co2e_per_kg}
                altName={alt.name}
                altCo2={alt.total_co2e_per_kg}
                altEmoji={categoryEmoji[alt.category] || "🍽️"}
                savingsPercent={savings > 0 ? savings : 0}
              />
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No lower-impact alternatives found with these filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default AlternativesScreen;
