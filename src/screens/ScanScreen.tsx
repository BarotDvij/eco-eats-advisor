import { motion } from "framer-motion";
import { X, Camera, Barcode } from "lucide-react";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import BarcodeMode from "@/components/BarcodeMode";
import PhotoMode from "@/components/PhotoMode";

interface ScanScreenProps {
  onClose: () => void;
  onScanResult: (product: Tables<"food_products">) => void;
}

type Mode = "barcode" | "photo";

const MODES = [
  { id: "barcode", label: "Barcode", Icon: Barcode },
  { id: "photo", label: "Photo", Icon: Camera },
] as const;

const ScanScreen = ({ onClose, onScanResult }: ScanScreenProps) => {
  const [mode, setMode] = useState<Mode>("barcode");

  const header = (
    <div className="relative z-10 flex items-center justify-between p-5 pt-14">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
      >
        <X className="w-4 h-4 text-primary-foreground" />
      </motion.button>
      <span className="label-caps text-primary-foreground/60">
        {mode === "barcode" ? "Scan Barcode" : "Photo Mode"}
      </span>
      <div className="w-9" />
    </div>
  );

  // Switching modes unmounts the other one, which stops its camera.
  const modeToggle = (
    <div className="flex bg-primary-foreground/10 rounded-lg p-1 mx-auto max-w-[240px]">
      {MODES.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            mode === id
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "text-primary-foreground/40"
          }`}
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </button>
      ))}
    </div>
  );

  const Body = mode === "barcode" ? BarcodeMode : PhotoMode;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground flex flex-col"
    >
      <Body header={header} modeToggle={modeToggle} onScanResult={onScanResult} />
    </motion.div>
  );
};

export default ScanScreen;
