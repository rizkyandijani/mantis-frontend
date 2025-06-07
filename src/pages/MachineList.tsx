// src/pages/MachineList.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Machine {
  id: string;
  name: string;
  section: string;
}

export default function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    axios.get("/api/machines").then((res) => setMachines(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Mesin</h2>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID Mesin</th>
              <th className="p-2 border">Nama Mesin</th>
              <th className="p-2 border">Section</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-2 border">{m.id}</td>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.section}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
