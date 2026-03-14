import { motion } from "framer-motion";
import { ChevronLeft, Egg, Milk, Leaf } from "lucide-react";
import { useState } from "react";
import AlternativeCard from "../components/AlternativeCard";

const filters = [
  { id: "no-peanuts", label: "No Peanuts", icon: "🥜" },
  { id: "no-beef", label: "No Beef", icon: "🐄" },
  { id: "local", label: "Local Only", icon: "📍" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
];

const alternatives = [
  {
    currentName: "Beef Patty",
    currentCo2: 4.2,
    altName: "Beyond Meat",
    altCo2: 0.5,
    altEmoji: "🌱",
    savingsPercent: 88,
  },
  {
    currentName: "Beef Patty",
    currentCo2: 4.2,
    altName: "Portobello Cap",
    altCo2: 0.1,
    altEmoji: "🍄",
    savingsPercent: 97,
  },
  {
    currentName: "Beef Patty",
    currentCo2: 4.2,
    altName: "Black Bean Patty",
    altCo2: 0.3,
    altEmoji: "🫘",
    savingsPercent: 93,
  },
  {
    currentName: "Beef Patty",
    currentCo2: 4.2,
    altName: "Chicken Breast",
    altCo2: 1.8,
    altEmoji: "🍗",
    savingsPercent: 57,
  },
];

interface AlternativesScreenProps {
  onBack: () => void;
}

const AlternativesScreen = ({ onBack }: AlternativesScreenProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div>
          <div className="label-caps text-muted-foreground">Alternatives</div>
          <h1 className="text-base font-medium tracking-tight">Lower Impact Options</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {filters.map((f) => {
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
        {alternatives.map((alt, i) => (
          <motion.div
            key={alt.altName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <AlternativeCard {...alt} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlternativesScreen;
