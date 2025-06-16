// src/pages/QRScanPage.tsx
import QRScanner from "../../components/QrScanner";
import { useNavigate } from "react-router-dom";

export default function QRScanPage() {
  console.log("cek scan page render");
  const navigate = useNavigate();

  const handleScanSuccess = (data: string) => {
    // Misal isi QR adalah "https://mantis.app/qr/12345"
    console.log("Scanned QR DATA:", data);
    // navigate(`/qr-access?machineId=${extractMachineId(data)}`);
  };

  const extractMachineId = (urlOrId: string): string => {
    const match = urlOrId.match(/qr\/(\w+)$/);
    return match ? match[1] : urlOrId;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Scan QR Code</h2>
      <QRScanner onScanSuccess={handleScanSuccess} />
    </div>
  );
}
