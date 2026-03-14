import { motion } from "framer-motion";
import { X, Camera, Barcode, ImagePlus, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface ScanScreenProps {
  onClose: () => void;
  onScanResult: (product: Tables<"food_products">) => void;
}

const ScanScreen = ({ onClose, onScanResult }: ScanScreenProps) => {
  const [mode, setMode] = useState<"barcode" | "photo">("barcode");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleCapture = async () => {
    // Simulate scanning — pick a random product from DB
    const { data } = await supabase
      .from("food_products")
      .select("*")
      .limit(15);
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      onScanResult(random);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground flex flex-col"
    >
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/95" />
        
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

        <div className="relative z-10 flex-1 flex items-center justify-center mt-16">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 border border-dashed border-primary-foreground/40 rounded-xl relative overflow-hidden"
          >
            {selectedImage && mode === "photo" ? (
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 text-center text-sm text-primary-foreground/50 mt-8 px-8"
        >
          {mode === "barcode"
            ? "Point your camera at a product barcode"
            : "Take a photo of your meal to analyze"}
        </motion.p>
      </div>

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

        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center items-center gap-5">
            {mode === "photo" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center"
              >
                <ImagePlus className="w-5 h-5 text-primary-foreground" />
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCapture}
              className="w-16 h-16 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary-foreground" />
            </motion.button>

            {mode === "photo" && <div className="w-12" />}
          </div>

          {mode === "photo" && selectedImage && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCapture}
              className="w-full max-w-[240px] py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Scan Food
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ScanScreen;
