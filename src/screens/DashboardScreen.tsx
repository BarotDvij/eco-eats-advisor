import { motion } from "framer-motion";
import { TrendingDown, Car } from "lucide-react";
import WeeklyChart from "../components/WeeklyChart";

const weeklyData = [
  { day: "Mon", value: 1.8 },
  { day: "Tue", value: 3.2 },
  { day: "Wed", value: 1.4 },
  { day: "Thu", value: 2.6 },
  { day: "Fri", value: 1.1 },
  { day: "Sat", value: 2.8 },
  { day: "Sun", value: 0.9 },
];

const DashboardScreen = () => {
  const totalWeek = weeklyData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label-caps text-muted-foreground mb-1">Dashboard</div>
        <h1 className="text-base font-medium tracking-tight">Your Footprint</h1>
      </motion.div>

      {/* Hero stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card p-5 mt-5 mb-4"
      >
        <div className="label-caps text-muted-foreground mb-1">This Week Total</div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tighter tabular">{totalWeek.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">kg CO₂e</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-accent-low text-xs font-semibold">
          <TrendingDown className="w-3 h-3" /> 18% less than last week
        </div>
      </motion.div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl shadow-card p-4 mb-4"
      >
        <div className="label-caps text-muted-foreground mb-4">Daily Breakdown</div>
        <WeeklyChart data={weeklyData} />
      </motion.div>

      {/* Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl shadow-card p-4 mb-4"
      >
        <div className="label-caps text-muted-foreground mb-3">Milestone</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-low/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-accent-low" />
          </div>
          <div>
            <div className="text-sm font-medium">42 miles saved</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Equivalent driving emissions saved this month
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="label-caps text-muted-foreground mb-1">Items Scanned</div>
          <div className="text-2xl font-semibold tracking-tighter tabular">47</div>
          <div className="text-xs text-muted-foreground">This month</div>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="label-caps text-muted-foreground mb-1">Best Day</div>
          <div className="text-2xl font-semibold tracking-tighter tabular">0.4</div>
          <div className="text-xs text-muted-foreground">kg CO₂e (Mar 8)</div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardScreen;
