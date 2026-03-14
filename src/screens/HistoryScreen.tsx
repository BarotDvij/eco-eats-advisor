import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";

const history = [
  { name: "Oat Milk", brand: "Oatly", co2: 0.4, emoji: "🥛", time: "Today, 2:30 PM" },
  { name: "Beef Patty", brand: "Standard", co2: 4.2, emoji: "🥩", time: "Today, 12:15 PM" },
  { name: "Avocado", brand: "Del Monte", co2: 1.1, emoji: "🥑", time: "Yesterday" },
  { name: "Greek Yogurt", brand: "Chobani", co2: 0.7, emoji: "🫙", time: "Yesterday" },
  { name: "Chicken Breast", brand: "Local Farm", co2: 1.8, emoji: "🍗", time: "Mar 11" },
  { name: "Rice (1kg)", brand: "Uncle Ben's", co2: 2.7, emoji: "🍚", time: "Mar 10" },
  { name: "Almond Butter", brand: "Justin's", co2: 0.5, emoji: "🥜", time: "Mar 10" },
  { name: "Cheddar Cheese", brand: "Tillamook", co2: 3.1, emoji: "🧀", time: "Mar 9" },
];

const getColor = (v: number) => {
  if (v <= 1) return "hsl(var(--accent-low))";
  if (v <= 3) return "hsl(var(--accent-mid))";
  return "hsl(var(--accent-high))";
};

const HistoryScreen = () => {
  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label-caps text-muted-foreground mb-1">History</div>
        <h1 className="text-base font-medium tracking-tight">Scanned Items</h1>
      </motion.div>

      <div className="mt-5 space-y-2">
        {history.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-card rounded-xl shadow-card p-3 flex items-center gap-3 text-left"
          >
            <div className="text-xl">{item.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.brand} · {item.time}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-semibold tabular" style={{ color: getColor(item.co2) }}>
                {item.co2.toFixed(1)} kg
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HistoryScreen;
