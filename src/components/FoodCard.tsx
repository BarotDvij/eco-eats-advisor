import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface FoodCardProps {
  name: string;
  co2: number;
  category: string;
  emoji: string;
  onClick?: () => void;
}

const getImpactColor = (value: number) => {
  if (value <= 1) return "hsl(var(--accent-low))";
  if (value <= 3) return "hsl(var(--accent-mid))";
  return "hsl(var(--accent-high))";
};

const getImpactLabel = (value: number) => {
  if (value <= 1) return "Low";
  if (value <= 3) return "Medium";
  return "High";
};

const FoodCard = ({ name, co2, category, emoji, onClick }: FoodCardProps) => {
  const color = getImpactColor(co2);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex-shrink-0 w-40 bg-card rounded-2xl shadow-card p-3.5 text-left transition-all duration-200 hover:shadow-elevated bloom-border cursor-pointer active:ring-2 active:ring-primary/30 group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-10 h-10 rounded-xl bloom-gradient flex items-center justify-center text-xl">
          {emoji}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-sm font-medium tracking-tight truncate">{name}</div>
      <div className="text-xs text-muted-foreground mt-0.5 capitalize">{category}</div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold tabular" style={{ color }}>
            {co2.toFixed(1)} kg
          </span>
        </div>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: color + "1a", color }}
        >
          {getImpactLabel(co2)}
        </span>
      </div>
    </motion.button>
  );
};

export default FoodCard;
