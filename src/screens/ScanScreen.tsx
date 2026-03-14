import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Barcode, Search, Loader2, AlertCircle, ImagePlus } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { lookupAndEstimate } from "@/services/barcodeLookup";
import { estimateFromAIResult } from "@/services/imageEstimator";
import BarcodeScanner from "@/components/BarcodeScanner";

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
  const [cameraActive, setCameraActive] = useState(false);

  // Barcode mode state
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ phase: "idle" });
  const [analysisStep, setAnalysisStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Photo mode state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [photoCameraActive, setPhotoCameraActive] = useState(false);
  const [photoCameraError, setPhotoCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopPhotoCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setPhotoCameraActive(false);
  }, []);

  const startPhotoCamera = useCallback(async () => {
    try {
      setPhotoCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setPhotoCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Photo camera error:", error);
      setPhotoCameraError("Could not open camera. Please allow camera permission.");
      setPhotoCameraActive(false);
    }
  }, []);

  const capturePhotoFromPreview = useCallback(async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );

    if (!blob) return;

    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setSelectedFile(file);
    stopPhotoCamera();
  }, [stopPhotoCamera]);

  useEffect(() => {
    return () => stopPhotoCamera();
  }, [stopPhotoCamera]);

  // --- Barcode mode handlers ---

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

  const handleBarcodeDetected = useCallback((code: string) => {
    toast({ title: "Barcode detected", description: code });
    handleBarcodeLookup(code);
  }, [handleBarcodeLookup]);

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
      stopPhotoCamera();
    }
  };

  const handleScanFood = async () => {
    if (!selectedFile) return;
    setIsScanning(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile, selectedFile.name);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/food-image-scan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
          },
          body: formData,
          signal: controller.signal,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Scan failed");
      }

      const product = await estimateFromAIResult(result);
      if (product) {
        onScanResult(product);
      } else {
        toast({
          title: "Could not identify food",
          description: "Try a clearer photo or use barcode mode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Scan timed out. Please try again with a clearer photo."
          : "Could not scan image. Please try again.";
      toast({ title: "Scan failed", description: message, variant: "destructive" });
    } finally {
      clearTimeout(timeoutId);
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
          <div className="relative z-10 flex-1 flex flex-col items-center mt-4 px-6">
            {!isLoading && cameraActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 w-full"
              >
                <BarcodeScanner active={cameraActive} onDetected={handleBarcodeDetected} />
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
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  if (scanState.phase !== "idle") setScanState({ phase: "idle" });
                }}
                onKeyDown={handleKeyDown}
                placeholder="Or type barcode number…"
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
                  className="flex items-center gap-2 mt-4 text-sm text-destructive"
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
                  className="flex items-center gap-2 mt-4 text-sm text-destructive"
                >
                  <AlertCircle className="w-4 h-4" />
                  {scanState.message}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-primary-foreground/40 mt-4 px-4">
              Point your camera at a barcode, or type the number manually
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
              ) : photoCameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover rounded-xl" playsInline muted autoPlay />
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Camera className="w-8 h-8 text-primary-foreground/30" />
                    <p className="text-xs text-primary-foreground/30">Take or choose a photo</p>
                  </div>
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
            onClick={() => {
              setMode("barcode");
              stopPhotoCamera();
              setPhotoCameraError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              mode === "barcode"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/40"
            }`}
          >
            <Barcode className="w-3.5 h-3.5" /> Barcode
          </button>
          <button
            onClick={() => {
              setMode("photo");
              setCameraActive(false);
            }}
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
              onClick={() => handleBarcodeLookup()}
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
              {!photoCameraActive ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={startPhotoCamera}
                  className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Open Camera
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhotoFromPreview}
                  className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Capture
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center"
                title="Choose from gallery"
              >
                <ImagePlus className="w-5 h-5 text-primary-foreground" />
              </motion.button>
            </div>

            {photoCameraError && (
              <p className="text-xs text-destructive">{photoCameraError}</p>
            )}

            <p className="text-xs text-primary-foreground/40">
              📷 Camera preview in frame &nbsp;·&nbsp; 🖼️ Gallery
            </p>

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
