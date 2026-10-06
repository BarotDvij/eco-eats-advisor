import { motion } from "framer-motion";
import { Camera, Loader2, ImagePlus } from "lucide-react";
import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { estimateFromAIResult } from "@/services/imageEstimator";

interface PhotoModeProps {
  header: ReactNode;
  modeToggle: ReactNode;
  onScanResult: (product: Tables<"food_products">) => void;
}

const PhotoMode = ({ header, modeToggle, onScanResult }: PhotoModeProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Photo camera error:", err);
      setError("Could not open camera. Please allow camera permission.");
      setCameraActive(false);
    }
  }, []);

  const selectFile = (file: File) => {
    setSelectedImage(URL.createObjectURL(file));
    setSelectedFile(file);
    stopCamera();
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

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

    selectFile(new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" }));
  };

  useEffect(() => stopCamera, [stopCamera]);

  // The <video> only mounts once cameraActive is true, so attach the stream after that render.
  useEffect(() => {
    if (cameraActive && videoRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraActive]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const handleScanFood = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setError(null);

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
        setError("Could not identify food. Try a clearer photo or use barcode mode.");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "Scan timed out. Please try again with a clearer photo."
          : "Could not scan image. Please try again."
      );
    } finally {
      clearTimeout(timeoutId);
      setIsScanning(false);
    }
  };

  return (
    <>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/95" />
        {header}

        <div className="relative z-10 flex-1 flex items-center justify-center mt-16">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 border border-dashed border-primary-foreground/40 rounded-xl relative overflow-hidden"
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover rounded-xl" />
            ) : cameraActive ? (
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
      </div>

      <div className="relative z-10 bg-foreground p-5 pb-10 space-y-4">
        {modeToggle}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center items-center gap-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={cameraActive ? capturePhoto : startCamera}
              className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> {cameraActive ? "Capture" : "Open Camera"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center"
              title="Choose from gallery"
            >
              <ImagePlus className="w-5 h-5 text-primary-foreground" />
            </motion.button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

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
      </div>
    </>
  );
};

export default PhotoMode;
