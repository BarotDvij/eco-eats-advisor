import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import ImpactBreakdownBar from "../components/ImpactBreakdownBar";
import NutritionFacts from "../components/NutritionFacts";
import type { Tables } from "@/integrations/supabase/types";
import bloomBottom from "@/assets/bloom-flowers-bottom.png";
import DietaryConflictBanner from "@/components/DietaryConflictBanner";

interface ResultsScreenProps {
  product: Tables<"food_products">;
  onBack: () => void;
  onViewAlternatives: () => void;
}

const transportLabels: Record<string, string> = {
  air: "✈️ Air freight", sea: "🚢 Sea freight", rail: "🚂 Rail",
  road: "🚛 Road transport", local: "📍 Local sourcing",
};

const practiceLabels: Record<string, string> = {
  conventional: "Conventional farming",
  organic: "Organic certified",
  regenerative: "Regenerative agriculture",
  hydroponic: "Hydroponic",
  free_range: "Free-range",
  factory_farmed: "Factory farmed",
};

const ResultsScreen = ({ product, onBack, onViewAlternatives }: ResultsScreenProps) => {
  const breakdownSegments = [
    { label: "Ingredients", percentage: product.ingredient_co2e_pct, color: "hsl(340, 45%, 65%)" },
    { label: "Transport", percentage: product.transport_co2e_pct, color: "hsl(270, 40%, 78%)" },
    { label: "Packaging", percentage: product.packaging_co2e_pct, color: "hsl(145, 30%, 72%)" },
  ];

  const facts = [
    product.agricultural_practice
      ? `${practiceLabels[product.agricultural_practice]} practices`
      : null,
    product.origin_country && product.transport_method
      ? `${transportLabels[product.transport_method]} from ${product.origin_country} (${product.transport_distance_km?.toLocaleString() ?? "?"} km)`
      : null,
    product.water_use_liters_per_kg
      ? `Water usage: ${product.water_use_liters_per_kg.toLocaleString()} L/kg`
      : null,
    product.land_use_m2_per_kg
      ? `Land use: ${product.land_use_m2_per_kg} m²/kg`
      : null,
    product.packaging_material
      ? `Packaging: ${product.packaging_material}${product.packaging_recyclable ? " (recyclable ♻️)" : ""}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen pb-24 px-5 pt-14 relative overflow-hidden">
      {/* Floral bottom decoration */}
      <img
        src={bloomBottom}
        alt=""
        className="absolute bottom-16 left-0 right-0 w-full opacity-25 pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div>
          <div className="label-caps text-bloom-pink">Result</div>
          <h1 className="text-base font-medium tracking-tight font-display">
            {product.name}
            {product.brand && <span className="text-muted-foreground"> — {product.brand}</span>}
          </h1>
        </div>
      </div>

      {/* Dietary conflict warning */}
      <DietaryConflictBanner product={product} />

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl shadow-card bloom-border p-6 flex flex-col items-center gap-2 mb-4"
      >
        <ScoreGauge value={product.impact_score} />
        <div className="text-center text-xs text-muted-foreground mt-1">
          {product.total_co2e_per_kg} kg CO₂e per kg
        </div>
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl shadow-card bloom-border p-4 mb-4"
      >
        <ImpactBreakdownBar segments={breakdownSegments} />
      </motion.div>

      {/* Facts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-2xl shadow-card bloom-border p-4 mb-6"
      >
        <div className="label-caps text-muted-foreground mb-3 flex items-center gap-1">
          <Info className="w-3 h-3" /> Product Details
        </div>
        <ul className="space-y-2">
          {facts.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-bloom-pink mt-2 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Nutrition Facts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-card rounded-2xl shadow-card bloom-border p-4 mb-6"
      >
        <NutritionFacts
          calories={(product as any).calories_per_100g}
          protein={(product as any).protein_g}
          carbs={(product as any).carbs_g}
          fat={(product as any).fat_g}
          fiber={(product as any).fiber_g}
          sugar={(product as any).sugar_g}
          sodium={(product as any).sodium_mg}
        />
      </motion.div>
      <div className="flex gap-3 relative z-10">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onViewAlternatives}
          className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold shadow-card"
        >
          🌿 View Alternatives
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="h-12 px-5 bg-secondary text-secondary-foreground rounded-2xl text-sm font-medium"
        >
          Log Item
        </motion.button>
      </div>
    </div>
  );
};

export default ResultsScreen;
