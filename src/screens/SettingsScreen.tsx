import { motion } from "framer-motion";
import { ChevronRight, User, Bell, Globe, Shield, HelpCircle, LogOut } from "lucide-react";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", detail: "student@uni.edu" },
      { icon: Bell, label: "Notifications", detail: "On" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Globe, label: "Region", detail: "United States" },
      { icon: Shield, label: "Dietary Restrictions", detail: "None" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & FAQ", detail: "" },
      { icon: LogOut, label: "Sign Out", detail: "" },
    ],
  },
];

const SettingsScreen = () => {
  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="label-caps text-muted-foreground mb-1">Settings</div>
        <h1 className="text-base font-medium tracking-tight">Preferences</h1>
      </motion.div>

      <div className="mt-5 space-y-5">
        {settingsSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
          >
            <div className="label-caps text-muted-foreground mb-2">{section.title}</div>
            <div className="bg-card rounded-xl shadow-card overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.detail && (
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="label-caps text-muted-foreground">Trace v1.0</div>
      </div>
    </div>
  );
};

export default SettingsScreen;
