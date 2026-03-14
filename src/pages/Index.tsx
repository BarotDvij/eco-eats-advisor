import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import BottomNav from "../components/BottomNav";
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import ResultsScreen from "../screens/ResultsScreen";
import AlternativesScreen from "../screens/AlternativesScreen";
import DashboardScreen from "../screens/DashboardScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";

type Tab = "home" | "history" | "dashboard" | "settings";
type Overlay = null | "scan" | "results" | "alternatives";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);

  const renderTab = () => {
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            onScan={() => setOverlay("scan")}
            onSelectFood={() => setOverlay("results")}
          />
        );
      case "history":
        return <HistoryScreen />;
      case "dashboard":
        return <DashboardScreen />;
      case "settings":
        return <SettingsScreen />;
    }
  };

  const renderOverlay = () => {
    switch (overlay) {
      case "scan":
        return (
          <ScanScreen
            onClose={() => setOverlay(null)}
            onScanResult={() => setOverlay("results")}
          />
        );
      case "results":
        return (
          <ResultsScreen
            onBack={() => setOverlay(null)}
            onViewAlternatives={() => setOverlay("alternatives")}
          />
        );
      case "alternatives":
        return <AlternativesScreen onBack={() => setOverlay("results")} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      {renderTab()}
      <AnimatePresence>{renderOverlay()}</AnimatePresence>
      {!overlay && <BottomNav active={tab} onNavigate={setTab} />}
    </div>
  );
};

export default Index;
