import { motion } from "framer-motion";

interface ScoreGaugeProps {
  value: number; // kg CO2e
  maxValue?: number;
  size?: number;
}

const getImpactColor = (value: number) => {
  if (value <= 1) return "hsl(var(--accent-low))";
  if (value <= 3) return "hsl(var(--accent-mid))";
  return "hsl(var(--accent-high))";
};

const getImpactLabel = (value: number) => {
  if (value <= 1) return "Low Impact";
  if (value <= 3) return "Medium Impact";
  return "High Impact";
};

const ScoreGauge = ({ value, maxValue = 10, size = 180 }: ScoreGaugeProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const color = getImpactColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-semibold tracking-tighter tabular"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="label-caps text-muted-foreground mt-1">kg CO₂e</span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: color + "1a", color }}
      >
        {getImpactLabel(value)}
      </div>
    </div>
  );
};

export default ScoreGauge;
