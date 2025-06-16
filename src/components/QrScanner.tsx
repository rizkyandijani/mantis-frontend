import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const qrCodeRegionId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const hasStartedRef = useRef(false); // ✅ Flag to ensure start is only triggered once

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    if (!hasStartedRef.current) {
      hasStartedRef.current = true; // ✅ prevent re-entry
      html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!isRunningRef.current) return;
            onScanSuccess(decodedText);
            isRunningRef.current = false;

            html5QrCode
              .stop()
              .then(() => html5QrCode.clear())
              .catch((err) =>
                console.warn("QR stop() failed after scan success:", err)
              );
          },
          () => {}
        )
        .then(() => {
          isRunningRef.current = true;
        })
        .catch((err) => {
          console.error("Failed to start QR scanner:", err);
        });
    }

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((e) => console.warn("QR scanner stop error:", e));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="mt-4">
      <div id={qrCodeRegionId} className="w-full max-w-md mx-auto" />
    </div>
  );
}
