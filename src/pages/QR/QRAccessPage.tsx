// src/pages/QRAccessPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function QRAccessPage() {
  const { machineId } = useParams();
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    // Simulasi autentikasi dan ambil user
    const storedUser = localStorage.getItem("username") || "Mahasiswa";
    setUser(storedUser);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Checklist Harian</h2>
      <div className="bg-white shadow p-4 rounded-md space-y-2">
        <p>
          <strong>Nama Pengisi:</strong> {user}
        </p>
        <p>
          <strong>ID Mesin:</strong> {machineId}
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow">
          Lanjut ke Form
        </button>
      </div>
    </div>
  );
}
