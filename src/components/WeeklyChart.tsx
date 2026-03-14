import { motion } from "framer-motion";

interface DayData {
  day: string;
  value: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-1.5 h-32">
        {data.map((d, i) => {
          const heightPercent = (d.value / maxVal) * 100;
          const getColor = (v: number) => {
            if (v <= 1.5) return "bg-accent-low";
            if (v <= 3) return "bg-accent-mid";
            return "bg-accent-high";
          };
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] tabular font-semibold text-muted-foreground">
                {d.value.toFixed(1)}
              </span>
              <motion.div
                className={`w-full rounded-t-md ${getColor(d.value)}`}
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {data.map((d) => (
          <div key={d.day} className="flex-1 text-center">
            <span className="label-caps text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyChart;
