import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import ImpactBreakdownBar from "../components/ImpactBreakdownBar";

interface ResultsScreenProps {
  onBack: () => void;
  onViewAlternatives: () => void;
}

const breakdownSegments = [
  { label: "Ingredients", percentage: 78, color: "hsl(155, 100%, 12%)" },
  { label: "Transport", percentage: 15, color: "hsl(155, 60%, 35%)" },
  { label: "Packaging", percentage: 7, color: "hsl(155, 30%, 60%)" },
];

const reasons = [
  "High methane output from livestock rearing",
  "Plastic-heavy packaging increases waste footprint",
  "Regional sourcing reduces transport emissions",
];

const ResultsScreen = ({ onBack, onViewAlternatives }: ResultsScreenProps) => {
  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div>
          <div className="label-caps text-muted-foreground">Result</div>
          <h1 className="text-base font-medium tracking-tight">Beef Patty — 250g</h1>
        </div>
      </div>

      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card p-6 flex justify-center mb-4"
      >
        <ScoreGauge value={4.2} />
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl shadow-card p-4 mb-4"
      >
        <ImpactBreakdownBar segments={breakdownSegments} />
      </motion.div>

      {/* Why */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl shadow-card p-4 mb-6"
      >
        <div className="label-caps text-muted-foreground mb-3 flex items-center gap-1">
          <Info className="w-3 h-3" /> Contributing Factors
        </div>
        <ul className="space-y-2">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onViewAlternatives}
          className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-card"
        >
          View Alternatives
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="h-12 px-5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium"
        >
          Log Item
        </motion.button>
      </div>
    </div>
  );
};

export default ResultsScreen;
