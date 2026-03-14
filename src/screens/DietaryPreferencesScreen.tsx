import { motion } from "framer-motion";
import { ChevronLeft, Check, X } from "lucide-react";
import { DIETARY_CATEGORIES, useDietaryPreferences } from "@/hooks/use-dietary-preferences";

interface Props {
  onBack: () => void;
}

const DietaryPreferencesScreen = ({ onBack }: Props) => {
  const { isSelected, toggle, count, clear } = useDietaryPreferences();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background overflow-y-auto pb-24 px-5 pt-14"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div className="flex-1">
          <div className="label-caps text-muted-foreground">Settings</div>
          <h1 className="text-base font-medium tracking-tight">Dietary Preferences</h1>
        </div>
        {count > 0 && (
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        Select your dietary preferences, allergies, and sustainability goals. These will filter your food alternatives.
      </p>

      <div className="space-y-5">
        {DIETARY_CATEGORIES.map((category, catIdx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.06 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{category.icon}</span>
              <span className="label-caps text-muted-foreground">{category.label}</span>
            </div>
            <div className="bg-card rounded-xl shadow-card p-3 grid grid-cols-2 gap-2">
              {category.items.map((item) => {
                const active = isSelected(item.id);
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggle(item.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary/50 text-foreground border-transparent hover:border-border"
                    }`}
                  >
                    <span className="text-sm">{item.emoji}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-3 bg-primary/10 rounded-xl border border-primary/20 text-center"
        >
          <p className="text-xs font-medium text-primary">
            {count} preference{count !== 1 ? "s" : ""} selected — alternatives will be filtered accordingly
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DietaryPreferencesScreen;
