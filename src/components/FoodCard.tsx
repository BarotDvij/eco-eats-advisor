import { motion } from "framer-motion";

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

const FoodCard = ({ name, co2, category, emoji, onClick }: FoodCardProps) => {
  const color = getImpactColor(co2);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex-shrink-0 w-36 bg-card rounded-2xl shadow-card p-3.5 text-left transition-all duration-200 hover:shadow-elevated bloom-border"
    >
      <div className="w-10 h-10 rounded-xl bloom-gradient flex items-center justify-center text-xl mb-2.5">
        {emoji}
      </div>
      <div className="text-sm font-medium tracking-tight truncate">{name}</div>
      <div className="text-xs text-muted-foreground mt-0.5 capitalize">{category}</div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold tabular" style={{ color }}>
          {co2.toFixed(1)} kg
        </span>
      </div>
    </motion.button>
  );
};

export default FoodCard;
