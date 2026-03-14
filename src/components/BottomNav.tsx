import { Scan, Clock, BarChart3, Settings, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "home" | "history" | "chat" | "dashboard" | "settings";

interface BottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Scan; label: string }[] = [
  { id: "home", icon: Scan, label: "Scan" },
  { id: "history", icon: Clock, label: "History" },
  { id: "chat", icon: MessageCircle, label: "EcoBot" },
  { id: "dashboard", icon: BarChart3, label: "Dashboard" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
