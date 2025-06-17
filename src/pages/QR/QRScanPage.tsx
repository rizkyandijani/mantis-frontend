// src/pages/QRScanPage.tsx
import QRScanner from "../../components/QrScanner";
import { useNavigate } from "react-router-dom";
import { isValidUrl } from "../../utils/common";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useState } from "react";
import { QRInventoryResponseData } from "../../types/machine";

export default function QRScanPage() {
  const [urlFromQR, setUrlFromQR] = useState<string | null>(null);
  const [scanFinished, setFinishScan] = useState<boolean>(false);

  const {
    data: machineData,
    error,
    isFetching,
  } = useQuery<{ data: QRInventoryResponseData }>({
    queryKey: ["fetchProxy", urlFromQR],
    queryFn: () => apiFetch(`fetch-proxy?url=${urlFromQR}`),
    enabled: !!urlFromQR, // only fetch when QR is scanned
  });
  console.log("cek scan page render");
  const navigate = useNavigate();
  // const [qrData, setQrData] = useState<string>("");

  const handleScanSuccess = async (data: string) => {
    console.log("Scanned QR DATA:", data);
    setFinishScan(true);
    if (isValidUrl(data)) {
      try {
        setUrlFromQR(data);
        // const qrResponse = fetchData(data); //await apiFetch(`fetch-proxy?url=${data}`);
        // const machineDataFromQr = qrResponse;
        // console.log("machineDataFromQr", machineDataFromQr);
      } catch (error) {
        console.error("Error fetching machine data:", error);
      }
    } else {
      console.log("data is not url");
    }

    // navigate(`/qr-access?machineId=${extractMachineId(data)}`);
  };

  const extractMachineId = (urlOrId: string): string => {
    const match = urlOrId.match(/qr\/(\w+)$/);
    return match ? match[1] : urlOrId;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Scan QR Code</h2>
      {isFetching && <p>Loading data from QR...</p>}
      {error && <p>Error fetching QR data</p>}
      <QRScanner onScanSuccess={handleScanSuccess} />
      {machineData?.data && (
        <div className="mt-4 bg-gray-100 p-2 rounded">
          <h3 className="text-lg font-semibold">Data Mesin:</h3>
          <p>
            <strong>Id Mesin:</strong> {machineData.data.id_asset}
          </p>
          <p>
            <strong>Nama Mesin:</strong> {machineData.data.nama_asset}
          </p>
          <p>
            <strong>Jenis Mesin:</strong> {machineData.data.jenis}
          </p>
          <p>
            <strong>Kelompok Mesin:</strong> {machineData.data.kelompok}
          </p>
          <p>
            <strong>Tipe Mesin:</strong> {machineData.data.tipe}
          </p>
          <p>
            <strong>Status:</strong> {machineData.data.kondisi}
          </p>
          <button
            className="mt-2 bg-blue-800 text-white py-1 px-2 rounded hover:bg-blue-700"
            onClick={() => navigate(`/question/${machineData.data.id_asset}`)}
          >
            Lakukan Daily Maintenance Checklist
          </button>
        </div>
      )}
      {machineData?.data && (
        <div className="mt-4 bg-gray-100 p-2 rounded">
          {JSON.stringify(machineData.data, null, 2)}
        </div>
      )}
      {!machineData?.data && !isFetching && scanFinished && urlFromQR && (
        <p>QR Mesin tidak valid, data mesin tidak ditemukan</p>
      )}
      {!urlFromQR && !isFetching && scanFinished && (
        <p>QR bukan merupakan valid URL.</p>
      )}
    </div>
  );
}
