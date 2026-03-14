import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import FoodCard from "../components/FoodCard";

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
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="label-caps text-muted-foreground mb-1">Trace</div>
        <h1 className="text-base font-medium tracking-tight">Good morning.</h1>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food or brand..."
          className="w-full h-10 pl-9 pr-4 bg-card rounded-lg shadow-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </motion.div>

      {/* Weekly Sparkline */}
      {!search.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl shadow-card p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-caps text-muted-foreground">This Week</div>
              <div className="text-2xl font-semibold tracking-tighter tabular mt-0.5">
                12.9 <span className="text-sm font-normal text-muted-foreground">kg CO₂e</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-accent-low bg-accent-low/10 px-2 py-0.5 rounded-full">
              ↓ 18% vs last week
            </div>
          </div>
          <div className="flex items-end gap-1 h-10">
            {weekData.map((v, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-primary/20 rounded-sm"
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
        className="fixed bottom-20 left-5 right-5 max-w-md mx-auto"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onScan}
          className="w-full h-16 bg-primary text-primary-foreground rounded-2xl text-base font-semibold shadow-elevated flex items-center justify-center gap-2 transition-all duration-200"
        >
          <div className="w-5 h-5 border-2 border-primary-foreground/60 rounded" />
          Scan Food
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
