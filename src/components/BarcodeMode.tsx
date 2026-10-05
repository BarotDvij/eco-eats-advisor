import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback, type ReactNode } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { lookupAndEstimate } from "@/services/barcodeLookup";
import BarcodeScanner from "@/components/BarcodeScanner";

interface BarcodeModeProps {
  header: ReactNode;
  modeToggle: ReactNode;
  onScanResult: (product: Tables<"food_products">) => void;
}

type ScanState =
  | { phase: "idle" }
  | { phase: "searching"; barcode: string }
  | { phase: "not_found"; barcode: string }
  | { phase: "error"; message: string };

const ANALYSIS_STEPS = [
  "Looking up product…",
  "Analyzing ingredients…",
  "Estimating emissions…",
  "Calculating impact score…",
];

const BarcodeMode = ({ header, modeToggle, onScanResult }: BarcodeModeProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ phase: "idle" });
  const [analysisStep, setAnalysisStep] = useState(0);

  const runAnalysisAnimation = async (): Promise<void> => {
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const handleBarcodeLookup = useCallback(async (barcode?: string) => {
    const code = barcode || barcodeInput.trim();
    if (!code) return;

    setCameraActive(false);
    setBarcodeInput(code);
    setScanState({ phase: "searching", barcode: code });
    setAnalysisStep(0);

    const animationPromise = runAnalysisAnimation();
    const lookupPromise = lookupAndEstimate(code);

    const [, result] = await Promise.all([animationPromise, lookupPromise]);

    if (result.status === "found") {
      setScanState({ phase: "idle" });
      onScanResult(result.product);
    } else if (result.status === "not_found") {
      setScanState({ phase: "not_found", barcode: code });
    } else {
      setScanState({ phase: "error", message: result.message });
    }
  }, [barcodeInput, onScanResult]);

  const isLoading = scanState.phase === "searching";

  return (
    <>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/95" />
        {header}

        <div className="relative z-10 flex-1 flex flex-col items-center mt-4 px-6">
          {!isLoading && cameraActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 w-full"
            >
              <BarcodeScanner active={cameraActive} onDetected={handleBarcodeLookup} />
            </motion.div>
          )}

          {!isLoading && !cameraActive && (
            <button
              onClick={() => setCameraActive(true)}
              className="mb-4 w-full max-w-[240px] h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Open Camera Scanner
            </button>
          )}

          {isLoading && (
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-64 h-40 border border-dashed border-primary-foreground/40 rounded-xl relative mb-4 flex flex-col items-center justify-center gap-3"
            >
              <Loader2 className="w-6 h-6 text-accent-low animate-spin" />
              <motion.p
                key={analysisStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary-foreground/70"
              >
                {ANALYSIS_STEPS[analysisStep]}
              </motion.p>
            </motion.div>
          )}

          <div className="w-full max-w-[280px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
            <input
              type="text"
              inputMode="numeric"
              value={barcodeInput}
              onChange={(e) => {
                setBarcodeInput(e.target.value);
                if (scanState.phase !== "idle") setScanState({ phase: "idle" });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeLookup()}
              placeholder="Or type barcode number…"
              disabled={isLoading}
              className="w-full h-11 pl-10 pr-4 bg-primary-foreground/10 rounded-xl text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent-low/50 transition-all disabled:opacity-50"
            />
          </div>

          <AnimatePresence mode="wait">
            {(scanState.phase === "not_found" || scanState.phase === "error") && (
              <motion.div
                key={scanState.phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-4 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4" />
                {scanState.phase === "error"
                  ? scanState.message
                  : "Product not found in database. Try another barcode."}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-primary-foreground/40 mt-4 px-4">
            Point your camera at a barcode, or type the number manually
          </p>
        </div>
      </div>

      <div className="relative z-10 bg-foreground p-5 pb-10 space-y-4">
        {modeToggle}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => handleBarcodeLookup()}
            disabled={!barcodeInput.trim() || isLoading}
            className="w-full max-w-[240px] h-12 rounded-2xl bg-accent-low text-foreground text-sm font-semibold disabled:opacity-40 transition-all"
          >
            {isLoading ? "Analyzing…" : "Look Up Product"}
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default BarcodeMode;
