import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  active: boolean;
}

const BarcodeScanner = ({ onDetected, active }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    detectedRef.current = false;
    const scannerId = "barcode-scanner-region";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

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
            : "Camera access denied. Please allow camera permissions and try again."
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
      scannerRef.current = null;
    };
  }, [active, onDetected]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 py-8">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <p className="text-xs text-primary-foreground/40">
          You can still type the barcode number manually below.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[300px] mx-auto overflow-hidden rounded-xl">
      <div id="barcode-scanner-region" />
    </div>
  );
};

export default BarcodeScanner;
