import QRScanner from "../../components/QrScanner";
import { useLocation, useNavigate } from "react-router-dom";
import { isValidUrl } from "../../utils/common";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useState } from "react";
import { QRInventoryResponseData, MachineData } from "../../types/machine";

const mapQRResponseData = (data: QRInventoryResponseData) => {
  return {
    machineCommonType: data.jenis,
    machineSpecificType: data.tipe,
    inventoryId: data.id_asset,
    machineGroup: data.kelompok,
    name: data.nama_asset,
  };
};

export default function MachineQRScanPage() {
  const location = useLocation();
  const [urlFromQR, setUrlFromQR] = useState<string | null>(null);
  const [scanFinished, setFinishScan] = useState<boolean>(false);
  const [scannerKey, setScannerKey] = useState(0);

  const navigate = useNavigate();

  // 1️⃣ Fetch HTML → parsed machine data from proxy
  const {
    data: machineDataResult,
    error: fetchError,
    isFetching: isFetchingQR,
  } = useQuery<{ data: QRInventoryResponseData }>({
    queryKey: ["fetchProxy", urlFromQR],
    queryFn: () => apiFetch(`fetch-proxy?url=${urlFromQR}`),
    enabled: !!urlFromQR,
  });

  // 2️⃣ Extract inventory ID after QR data fetched
  const inventoryId = machineDataResult?.data?.id_asset;

  // 3️⃣ Check if machine with same inventory ID is already registered
  const {
    data: registeredMachine,
    isLoading: isCheckingMachine,
    error: checkError,
  } = useQuery<MachineData>({
    queryKey: ["checkMachine", inventoryId],
    queryFn: () => apiFetch(`machine/byInventoryId/${inventoryId}`),
    enabled: !!inventoryId,
  });

  const machineNotFound =
    checkError && checkError.message === "|Machine not found";

  // 🔁 QR Handler
  const handleScanSuccess = async (data: string) => {
    setFinishScan(true);
    if (isValidUrl(data)) {
      setUrlFromQR(data);
    } else {
      console.log("data is not url");
    }
  };

  return (
    <div className="p-4">
      <a
        href={location.state.from ?? "/login"}
        className="text-blue-500 text-underline"
      >
        {`< kembali`}
      </a>
      <h2 className="text-xl font-bold">Scan QR Code</h2>

      {isFetchingQR && <p>Memuat data QR mesin...</p>}
      {fetchError && <p>Gagal mengambil data dari URL QR</p>}

      <QRScanner key={scannerKey} onScanSuccess={handleScanSuccess} />

      {machineDataResult?.data && (
        <div className="mt-4 bg-gray-100 p-3 rounded">
          <h3 className="text-lg font-semibold">Hasil dari QR:</h3>
          <p>
            <strong>ID Asset:</strong> {machineDataResult.data.id_asset}
          </p>
          <p>
            <strong>Nama:</strong> {machineDataResult.data.nama_asset}
          </p>
          <p>
            <strong>Jenis:</strong> {machineDataResult.data.jenis}
          </p>
          <p>
            <strong>Kelompok:</strong> {machineDataResult.data.kelompok}
          </p>
          <p>
            <strong>Tipe:</strong> {machineDataResult.data.tipe}
          </p>
          <p>
            <strong>Kondisi:</strong> {machineDataResult.data.kondisi}
          </p>

          {isCheckingMachine && <p>Mengecek apakah mesin sudah terdaftar...</p>}
          {checkError && !machineNotFound && <p>Gagal cek mesin di database</p>}
          {checkError && machineNotFound && (
            <p>Mesin belum terdaftar di Database</p>
          )}

          {registeredMachine ? (
            <p className="text-green-600 font-medium mt-2">
              Mesin sudah terdaftar.
            </p>
          ) : !isCheckingMachine ? (
            <button
              className="mt-3 bg-blue-800 text-white py-1 px-3 rounded hover:bg-blue-700"
              onClick={() =>
                navigate(`add-machine`, {
                  state: {
                    machineData: mapQRResponseData(machineDataResult.data),
                  },
                })
              }
            >
              Daftarkan Mesin?
            </button>
          ) : (
            <></>
          )}
        </div>
      )}

      {!machineDataResult?.data &&
        !isFetchingQR &&
        scanFinished &&
        urlFromQR && (
          <p>QR berhasil dibaca tapi tidak mengandung data mesin valid</p>
        )}

      {!urlFromQR && scanFinished && <p>QR URL tidak valid.</p>}
      {scanFinished && !isCheckingMachine && (
        <div className="py-2 text-center">
          <button
            className="bg-blue-700 text-white cursor-pointer hover:bg-blue-500 rounded px-2 py-2"
            onClick={() => {
              // Reset state
              setUrlFromQR(null);
              setFinishScan(false);
              setScannerKey((prev) => prev + 1); // trigger re-render
            }}
          >
            {"Re-scan QR"}
          </button>
        </div>
      )}
    </div>
  );
}
