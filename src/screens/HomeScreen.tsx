import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import FoodCard from "../components/FoodCard";
import bloomTop from "@/assets/bloom-flowers-top.png";

interface HomeScreenProps {
  onScan: () => void;
  onSelectProduct: (product: Tables<"food_products">) => void;
}

const categoryEmoji: Record<string, string> = {
  meat: "🥩", dairy: "🥛", dairy_alternative: "🥛", produce: "🥑",
  spreads: "🥜", protein: "🌱", seafood: "🐟", legumes: "🫘",
  grains: "🌾", snacks: "🍫",
};

const weekData = [0.8, 2.1, 1.4, 3.2, 1.8, 2.4, 1.2];

const HomeScreen = ({ onScan, onSelectProduct }: HomeScreenProps) => {
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

  return (
    <div className="min-h-screen pb-24 px-5 pt-14 relative overflow-hidden">
      {/* Floral decoration */}
      <img
        src={bloomTop}
        alt=""
        className="absolute -top-4 -right-8 w-48 opacity-40 pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 relative z-10"
      >
        <div className="label-caps text-bloom-pink mb-1">🌸 Bloom</div>
        <h1 className="text-xl font-semibold tracking-tight font-display">Good morning.</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your food's footprint</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6 z-10"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food or brand..."
          className="w-full h-11 pl-10 pr-4 bg-card rounded-2xl shadow-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bloom-border transition-all"
        />
      </motion.div>

      {/* Weekly Sparkline */}
      {!search.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl shadow-card p-4 mb-6 bloom-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-caps text-muted-foreground">This Week</div>
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
                style={{ background: `linear-gradient(to top, hsl(var(--bloom-sage)), hsl(var(--accent-low)))` }}
                initial={{ height: 0 }}
                animate={{ height: `${(v / 4) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Product List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="label-caps text-muted-foreground">
            {search.trim() ? "Search Results" : "Recent Products"}
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
          onClick={onScan}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-base font-semibold shadow-elevated flex items-center justify-center gap-2 transition-all duration-200"
        >
          <span className="text-lg">🌱</span>
          Scan Food
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
