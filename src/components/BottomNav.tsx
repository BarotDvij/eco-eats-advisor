import { Scan, Clock, BarChart3, Settings, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "home" | "history" | "chat" | "dashboard" | "settings";

interface BottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Scan; label: string; emoji: string }[] = [
  { id: "home", icon: Scan, label: "Home", emoji: "🌸" },
  { id: "history", icon: Clock, label: "History", emoji: "🌺" },
  { id: "chat", icon: MessageCircle, label: "Chat", emoji: "🌷" },
  { id: "dashboard", icon: BarChart3, label: "Stats", emoji: "🌻" },
  { id: "settings", icon: Settings, label: "Settings", emoji: "🌿" },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-xl border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {isActive ? (
                <motion.span
                  className="text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {tab.emoji}
                </motion.span>
              ) : (
                <tab.icon className="w-5 h-5" strokeWidth={1.5} />
              )}
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
