import { useEffect, useRef, useState, forwardRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  active: boolean;
}

const BarcodeScanner = forwardRef<HTMLDivElement, BarcodeScannerProps>(
  ({ onDetected, active }, ref) => {
    const runningRef = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const detectedRef = useRef(false);

    useEffect(() => {
      if (!active) return;

      detectedRef.current = false;
      setError(null);
      const scannerId = "barcode-scanner-region";
      const scanner = new Html5Qrcode(scannerId);

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.6 },
          (decodedText) => {
            if (!detectedRef.current) {
              detectedRef.current = true;
              onDetected(decodedText);
            }
          },
          () => {}
        )
        .then(() => {
          runningRef.current = true;
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError(
            typeof err === "string"
              ? err
              : "Could not open camera. Please allow camera permission and try again."
          );
        });

      return () => {
        if (runningRef.current) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
          runningRef.current = false;
        }
      };
    }, [active, onDetected]);

    if (error) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center text-center px-4 py-8">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <p className="text-xs text-primary-foreground/40">
            You can still type the barcode number manually below.
          </p>
        </div>
      );
    }

    return (
      <div ref={ref} className="w-full max-w-[300px] mx-auto overflow-hidden rounded-xl border border-primary-foreground/20">
        <div id="barcode-scanner-region" className="min-h-[180px]" />
      </div>
    );
  }
);

BarcodeScanner.displayName = "BarcodeScanner";

export default BarcodeScanner;
