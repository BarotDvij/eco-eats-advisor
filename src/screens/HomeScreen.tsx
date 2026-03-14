import { motion } from "framer-motion";
import { Search, ChevronRight, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import FoodCard from "../components/FoodCard";
import ScoreGauge from "../components/ScoreGauge";
import ImpactBreakdownBar from "../components/ImpactBreakdownBar";
import bloomTop from "@/assets/bloom-flowers-top.png";
import bloomBottom from "@/assets/bloom-flowers-bottom.png";
import bloomAccent from "@/assets/bloom-flower-accent.png";

interface HomeScreenProps {
  onScan: () => void;
  onSelectProduct: (product: Tables<"food_products">) => void;
  highlightedProduct?: Tables<"food_products"> | null;
}

const categoryEmoji: Record<string, string> = {
  meat: "🥩", dairy: "🥛", dairy_alternative: "🥛", produce: "🥑",
  spreads: "🥜", protein: "🌱", seafood: "🐟", legumes: "🫘",
  grains: "🌾", snacks: "🍫",
};

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

const weekData = [0.8, 2.1, 1.4, 3.2, 1.8, 2.4, 1.2];

function buildFacts(product: Tables<"food_products">): string[] {
  return [
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
}

const HomeScreen = ({ onScan, onSelectProduct, highlightedProduct }: HomeScreenProps) => {
  const [products, setProducts] = useState<Tables<"food_products">[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Tables<"food_products">[]>([]);

  useEffect(() => {
    supabase
      .from("food_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered([]);
      return;
    }
    supabase
      .from("food_products")
      .select("*")
      .ilike("name", `%${search}%`)
      .limit(8)
      .then(({ data }) => {
        if (data) setFiltered(data);
      });
  }, [search]);

  const displayList = search.trim() ? filtered : products.slice(0, 3);

  const breakdownSegments = highlightedProduct
    ? [
        { label: "Ingredients", percentage: highlightedProduct.ingredient_co2e_pct, color: "hsl(340, 45%, 65%)" },
        { label: "Transport", percentage: highlightedProduct.transport_co2e_pct, color: "hsl(270, 40%, 78%)" },
        { label: "Packaging", percentage: highlightedProduct.packaging_co2e_pct, color: "hsl(145, 30%, 72%)" },
      ]
    : [];

  const facts = highlightedProduct ? buildFacts(highlightedProduct) : [];

  return (
    <div className="min-h-screen pb-24 px-5 pt-14 relative overflow-hidden">
      {/* Floral decorations */}
      <img
        src={bloomTop}
        alt=""
        className="absolute -top-4 -right-8 w-56 opacity-35 pointer-events-none select-none"
        aria-hidden="true"
      />
      <img
        src={bloomAccent}
        alt=""
        className="absolute top-32 -left-12 w-28 opacity-15 pointer-events-none select-none rotate-[-20deg]"
        aria-hidden="true"
      />
      <img
        src={bloomBottom}
        alt=""
        className="absolute bottom-16 left-0 right-0 w-full opacity-20 pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 relative z-10"
      >
        <div className="label-caps text-bloom-pink mb-1 flex items-center gap-1">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🌸
          </motion.span>
          Bloom
        </div>
        <h1 className="text-2xl font-semibold tracking-tight font-display">Good morning.</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your food's carbon footprint 🌿</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-4 z-10"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bloom-lavender" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food or brand..."
          className="w-full h-11 pl-10 pr-4 bg-card rounded-2xl shadow-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bloom-pink/30 bloom-border transition-all"
        />
      </motion.div>

      {/* Latest scan result — directly under search */}
      {highlightedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="relative z-10 mb-5 space-y-3"
        >
          {/* Score card with circle gauge */}
          <div className="bg-card rounded-2xl shadow-card bloom-border p-4">
            <div className="label-caps text-muted-foreground mb-2">Latest Loaded Result</div>
            <div className="flex items-center gap-4">
              <ScoreGauge value={highlightedProduct.impact_score} />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold tracking-tight font-display truncate">{highlightedProduct.name}</h2>
                {highlightedProduct.brand && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{highlightedProduct.brand}</p>
                )}
                <div className="text-lg font-bold tabular mt-1 text-foreground">
                  {highlightedProduct.total_co2e_per_kg}
                  <span className="text-xs font-medium text-muted-foreground ml-1">kg CO₂e/kg</span>
                </div>
              </div>
              <button onClick={() => onSelectProduct(highlightedProduct)} className="flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Impact breakdown */}
          <div className="bg-card rounded-2xl shadow-card bloom-border p-4">
            <ImpactBreakdownBar segments={breakdownSegments} />
          </div>

          {/* Product details */}
          {facts.length > 0 && (
            <div className="bg-card rounded-2xl shadow-card bloom-border p-4">
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
            </div>
          )}
        </motion.div>
      )}

      {/* Weekly Sparkline */}
      {!search.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-card p-4 mb-6 bloom-border relative overflow-hidden"
        >
          {/* Subtle floral bg pattern */}
          <div className="absolute inset-0 bloom-gradient opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="label-caps text-muted-foreground flex items-center gap-1">🌷 This Week</div>
                <div className="text-2xl font-semibold tracking-tighter tabular mt-0.5 font-display">
                  12.9 <span className="text-sm font-normal text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>kg CO₂e</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-accent-low bg-accent-low/10 px-2.5 py-1 rounded-full">
                ↓ 18% vs last week
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-10">
              {weekData.map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ background: `linear-gradient(to top, hsl(var(--bloom-sage)), hsl(var(--bloom-pink)))` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / 4) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Product List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="label-caps text-muted-foreground flex items-center gap-1">
            🌼 {search.trim() ? "Search Results" : "Recent Products"}
          </div>
          {!search.trim() && (
            <button className="flex items-center gap-0.5 text-xs text-primary font-medium">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {displayList.map((item) => (
            <FoodCard
              key={item.id}
              name={item.name}
              co2={item.total_co2e_per_kg}
              category={item.category}
              emoji={categoryEmoji[item.category] || "🍽️"}
              onClick={() => onSelectProduct(item)}
            />
          ))}
          {displayList.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              {search.trim() ? "No products found." : "Loading..."}
            </p>
          )}
        </div>
      </motion.div>

      {/* Scan Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-20 left-5 right-5 max-w-md mx-auto z-20"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={onScan}
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-elevated flex items-center justify-center gap-2 transition-all duration-200 text-primary-foreground"
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--bloom-pink)), hsl(var(--bloom-lavender)))`,
          }}
        >
          <motion.span
            className="text-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌱
          </motion.span>
          Scan Food
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
