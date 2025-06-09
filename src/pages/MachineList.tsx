// src/pages/MachineList.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";

interface Machine {
  id: string;
  name: string;
  section: string;
}

export const getMachineList = () => {
  return useQuery<Machine[]>({
    queryKey: ["listMachine"],
    queryFn: () => apiFetch("machine"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);

  const { data, error, isLoading } = getMachineList();

  useEffect(() => {
    if (data) {
      setMachines(data);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

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
