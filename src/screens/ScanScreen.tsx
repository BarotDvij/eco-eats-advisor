import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Barcode, Search, Loader2, AlertCircle, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { lookupAndEstimate } from "@/services/barcodeLookup";

interface ScanScreenProps {
  onClose: () => void;
  onScanResult: (product: Tables<"food_products">) => void;
}

type ScanState =
  | { phase: "idle" }
  | { phase: "searching"; barcode: string }
  | { phase: "analyzing" }
  | { phase: "not_found"; barcode: string }
  | { phase: "error"; message: string };

const ANALYSIS_STEPS = [
  "Looking up product…",
  "Analyzing ingredients…",
  "Estimating emissions…",
  "Calculating impact score…",
];

const ScanScreen = ({ onClose, onScanResult }: ScanScreenProps) => {
  const [mode, setMode] = useState<"barcode" | "photo">("barcode");

  // Barcode mode state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ phase: "idle" });
  const [analysisStep, setAnalysisStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Photo mode state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Barcode mode handlers ---

  const runAnalysisAnimation = async (): Promise<void> => {
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }
  };

  const handleBarcodeLookup = async () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    setScanState({ phase: "searching", barcode });
    setAnalysisStep(0);

    const animationPromise = runAnalysisAnimation();
    const lookupPromise = lookupAndEstimate(barcode);

    const [, result] = await Promise.all([animationPromise, lookupPromise]);

    if (result.status === "found") {
      setScanState({ phase: "idle" });
      onScanResult(result.product);
    } else if (result.status === "not_found") {
      setScanState({ phase: "not_found", barcode });
    } else {
      setScanState({ phase: "error", message: result.message });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBarcodeLookup();
    }
  };

  // --- Photo mode handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
    }
  };

  const handleScanFood = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile, selectedFile.name);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/food-image-scan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Scan failed');
      }

      toast({ title: "📸 Image sent!", description: "Your food image is being analyzed by the workflow." });

      // Fall back to a DB product for now
      const { data } = await supabase
        .from("food_products")
        .select("*")
        .limit(15);
      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        onScanResult(random);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({ title: "Scan failed", description: "Could not send image. Please try again.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const isLoading = scanState.phase === "searching" || scanState.phase === "analyzing";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground flex flex-col"
    >
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/95" />

        {/* Header */}
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

        {/* Barcode mode content */}
        {mode === "barcode" && (
          <div className="relative z-10 flex-1 flex flex-col items-center mt-8 px-6">
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-64 h-40 border border-dashed border-primary-foreground/40 rounded-xl relative mb-8"
            >
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-primary-foreground/80 ${cls}`} />
              ))}

              {!isLoading && (
                <motion.div
                  className="absolute left-4 right-4 h-px bg-accent-low"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
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
              </AnimatePresence>
            </motion.div>

            <div className="w-full max-w-[280px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  if (scanState.phase !== "idle") setScanState({ phase: "idle" });
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter barcode number…"
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-4 bg-primary-foreground/10 rounded-xl text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent-low/50 transition-all disabled:opacity-50"
              />
            </div>

            <AnimatePresence mode="wait">
              {scanState.phase === "not_found" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-4 text-sm text-amber-400"
                >
                  <AlertCircle className="w-4 h-4" />
                  Product not found in database. Try another barcode.
                </motion.div>
              )}
              {scanState.phase === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-4 text-sm text-red-400"
                >
                  <AlertCircle className="w-4 h-4" />
                  {scanState.message}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-primary-foreground/40 mt-6 px-4">
              Enter or scan a barcode to look up the product on Open Food Facts and estimate its carbon footprint
            </p>
          </div>
        )}

        {/* Photo mode content */}
        {mode === "photo" && (
          <div className="relative z-10 flex-1 flex items-center justify-center mt-16">
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-64 h-64 border border-dashed border-primary-foreground/40 rounded-xl relative overflow-hidden"
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  {[
                    "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
                    "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                    "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
                    "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-primary-foreground/80 ${cls}`} />
                  ))}
                  <motion.div
                    className="absolute left-4 right-4 h-px bg-accent-low"
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 bg-foreground p-5 pb-10 space-y-4">
        <div className="flex bg-primary-foreground/10 rounded-lg p-1 mx-auto max-w-[240px]">
          <button
            onClick={() => setMode("barcode")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              mode === "barcode"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/40"
            }`}
          >
            <Barcode className="w-3.5 h-3.5" /> Barcode
          </button>
          <button
            onClick={() => setMode("photo")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              mode === "photo"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/40"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Photo
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {mode === "barcode" && (
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleBarcodeLookup}
              disabled={!barcodeInput.trim() || isLoading}
              className="w-full max-w-[240px] h-12 rounded-2xl bg-accent-low text-foreground text-sm font-semibold disabled:opacity-40 transition-all"
            >
              {isLoading ? "Analyzing…" : "Look Up Product"}
            </motion.button>
          </div>
        )}

        {mode === "photo" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center"
              >
                <ImagePlus className="w-5 h-5 text-primary-foreground" />
              </motion.button>

              <div className="w-12" />
            </div>

            {selectedImage && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleScanFood}
                disabled={isScanning}
                className="w-full max-w-[240px] py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
                ) : (
                  <><Camera className="w-4 h-4" /> Scan Food</>
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScanScreen;
