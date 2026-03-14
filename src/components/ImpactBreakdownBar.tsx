import { motion } from "framer-motion";

interface Segment {
  label: string;
  percentage: number;
  color: string;
}

interface ImpactBreakdownBarProps {
  segments: Segment[];
}

const ImpactBreakdownBar = ({ segments }: ImpactBreakdownBarProps) => {
  return (
    <div className="space-y-3">
      <div className="label-caps text-muted-foreground">Impact Breakdown</div>
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: seg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${seg.percentage}%` }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-muted-foreground">
              {seg.label} ({seg.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactBreakdownBar;
