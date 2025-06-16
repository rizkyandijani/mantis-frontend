// src/pages/MachineStatus.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface MachineStatus {
  id: string;
  name: string;
  status: string;
  lastReportDate: string;
}

export default function MachineStatus() {
  const [statuses, setStatuses] = useState<MachineStatus[]>([]);

  useEffect(() => {
    axios.get("/api/machines/status").then((res) => setStatuses(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Status Mesin</h2>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID Mesin</th>
              <th className="p-2 border">Nama Mesin</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Laporan Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-2 border">{m.id}</td>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.status}</td>
                <td className="p-2 border">{m.lastReportDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
