import { motion } from "framer-motion";
import { ChevronRight, User, Bell, Globe, Shield, HelpCircle, LogOut, Sun, Moon, Type } from "lucide-react";
import { useTheme, FONT_SIZE_OPTIONS } from "@/hooks/use-theme";
import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";

interface Props {
  onOpenDietary?: () => void;
}

const SettingsScreen = ({ onOpenDietary }: Props) => {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { getSummary } = useDietaryPreferences();

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label-caps text-bloom-pink mb-1">Settings</div>
        <h1 className="text-xl font-semibold tracking-tight font-display">Preferences</h1>
      </motion.div>

      <div className="mt-5 space-y-5">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="label-caps text-muted-foreground mb-2">Appearance</div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
            {/* Theme Toggle */}
            <div className="p-3.5">
              <div className="flex items-center gap-3 mb-3">
                {theme === "light" ? (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium flex-1">Theme</span>
              </div>
              <div className="flex rounded-lg bg-secondary p-1 gap-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                    theme === "light"
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                    theme === "dark"
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="p-3.5">
              <div className="flex items-center gap-3 mb-3">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">Font Size</span>
                <span className="text-xs text-muted-foreground capitalize">{fontSize}</span>
              </div>
              <div className="flex rounded-lg bg-secondary p-1 gap-1">
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontSize(opt.value)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                      fontSize === opt.value
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Preview: <span style={{ fontSize: "1em" }}>The quick brown fox jumps over the lazy dog.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="label-caps text-muted-foreground mb-2">Account</div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
            {[
              { icon: User, label: "Profile", detail: "student@uni.edu" },
              { icon: Bell, label: "Notifications", detail: "On" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.detail && <span className="text-xs text-muted-foreground">{item.detail}</span>}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="label-caps text-muted-foreground mb-2">Preferences</div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
            <button
              className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/50 transition-colors"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Region</span>
              <span className="text-xs text-muted-foreground">United States</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={onOpenDietary}
              className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/50 transition-colors"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Dietary Restrictions</span>
              <span className="text-xs text-muted-foreground">{getSummary()}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <div className="label-caps text-muted-foreground mb-2">Support</div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
            {[
              { icon: HelpCircle, label: "Help & FAQ", detail: "" },
              { icon: LogOut, label: "Sign Out", detail: "" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.detail && <span className="text-xs text-muted-foreground">{item.detail}</span>}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <div className="label-caps text-muted-foreground">Trace v1.0</div>
      </div>
    </div>
  );
};

export default SettingsScreen;
