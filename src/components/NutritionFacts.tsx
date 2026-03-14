import { motion } from "framer-motion";

interface NutritionFactsProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}

interface NutrientBarProps {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
  emoji: string;
  delay: number;
}

const NutrientBar = ({ label, value, unit, max, color, emoji, delay }: NutrientBarProps) => {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-5 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs text-muted-foreground tabular">
            {value}{unit}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
      </div>
    </div>
  );
};

const NutritionFacts = ({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
}: NutritionFactsProps) => {
  const hasData = calories != null || protein != null || carbs != null || fat != null;

  if (!hasData) return null;

  const nutrients = [
    { label: "Calories", value: calories ?? 0, unit: " kcal", max: 600, color: "hsl(var(--primary))", emoji: "🔥" },
    { label: "Protein", value: protein ?? 0, unit: "g", max: 50, color: "hsl(var(--bloom-lavender))", emoji: "💪" },
    { label: "Carbs", value: carbs ?? 0, unit: "g", max: 80, color: "hsl(var(--bloom-peach))", emoji: "🌾" },
    { label: "Fat", value: fat ?? 0, unit: "g", max: 65, color: "hsl(var(--bloom-sage))", emoji: "🫒" },
    { label: "Fiber", value: fiber ?? 0, unit: "g", max: 30, color: "hsl(var(--accent))", emoji: "🥦" },
    { label: "Sugar", value: sugar ?? 0, unit: "g", max: 50, color: "hsl(var(--accent-mid))", emoji: "🍯" },
    { label: "Sodium", value: sodium ?? 0, unit: "mg", max: 1500, color: "hsl(var(--accent-high))", emoji: "🧂" },
  ].filter((n) => n.value > 0);

  return (
    <div>
      <div className="label-caps text-muted-foreground mb-3 flex items-center gap-1">
        🌸 Nutrition Facts <span className="font-normal normal-case tracking-normal">(per 100g)</span>
      </div>

      {/* Calorie hero */}
      {calories != null && calories > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bloom-gradient">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥
          </motion.span>
          <div>
            <div className="text-2xl font-semibold tracking-tighter font-display tabular">
              {calories}
            </div>
            <div className="text-xs text-muted-foreground">calories per 100g</div>
          </div>
        </div>
      )}

      {/* Macro bars */}
      <div className="space-y-3">
        {nutrients
          .filter((n) => n.label !== "Calories")
          .map((n, i) => (
            <NutrientBar key={n.label} {...n} delay={0.1 + i * 0.06} />
          ))}
      </div>
    </div>
  );
};

export default NutritionFacts;
