import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

interface AlternativeCardProps {
  currentName: string;
  currentCo2: number;
  altName: string;
  altCo2: number;
  altEmoji: string;
  savingsPercent: number;
  onFindInStore?: () => void;
}

const AlternativeCard = ({
  currentName,
  currentCo2,
  altName,
  altCo2,
  altEmoji,
  savingsPercent,
  onFindInStore,
}: AlternativeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-card p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="label-caps text-muted-foreground mb-1">Current</div>
          <div className="text-sm font-medium">{currentName}</div>
          <div className="text-xs tabular text-accent-high font-semibold">{currentCo2.toFixed(1)} kg CO₂e</div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <div className="label-caps text-accent-low mb-1">Better</div>
          <div className="text-sm font-medium flex items-center gap-1">
            <span>{altEmoji}</span> {altName}
          </div>
          <div className="text-xs tabular text-accent-low font-semibold">{altCo2.toFixed(1)} kg CO₂e</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-accent-low bg-accent-low/10 px-2 py-0.5 rounded-full">
          -{savingsPercent}% CO₂e
        </span>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onFindInStore}
          className="flex items-center gap-1 text-xs font-medium text-primary px-3 py-1.5 bg-secondary rounded-lg"
        >
          <MapPin className="w-3 h-3" /> Find in Store
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AlternativeCard;
