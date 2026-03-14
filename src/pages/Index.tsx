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
import ChatScreen from "../screens/ChatScreen";
import DietaryPreferencesScreen from "../screens/DietaryPreferencesScreen";
import type { Tables } from "@/integrations/supabase/types";

type Tab = "home" | "history" | "chat" | "dashboard" | "settings";
type Overlay = null | "scan" | "results" | "alternatives" | "dietary";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedProduct, setSelectedProduct] = useState<Tables<"food_products"> | null>(null);

  const handleSelectProduct = (product: Tables<"food_products">) => {
    setSelectedProduct(product);
    setOverlay("results");
  };

  const renderTab = () => {
    switch (tab) {
      case "home":
        return (
          <HomeScreen
            onScan={() => setOverlay("scan")}
            onSelectProduct={handleSelectProduct}
          />
        );
      case "history":
        return <HistoryScreen />;
      case "chat":
        return <ChatScreen onClose={() => setTab("home")} />;
      case "dashboard":
        return <DashboardScreen />;
      case "settings":
        return <SettingsScreen onOpenDietary={() => setOverlay("dietary")} />;
    }
  };

  const renderOverlay = () => {
    switch (overlay) {
      case "scan":
        return (
          <ScanScreen
            onClose={() => setOverlay(null)}
            onScanResult={handleSelectProduct}
          />
        );
      case "results":
        return selectedProduct ? (
          <ResultsScreen
            product={selectedProduct}
            onBack={() => setOverlay(null)}
            onViewAlternatives={() => setOverlay("alternatives")}
          />
        ) : null;
      case "alternatives":
        return selectedProduct ? (
          <AlternativesScreen
            product={selectedProduct}
            onBack={() => setOverlay("results")}
            onSelectProduct={handleSelectProduct}
          />
        ) : null;
      case "dietary":
        return <DietaryPreferencesScreen onBack={() => setOverlay(null)} />;
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
