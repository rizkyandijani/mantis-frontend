// src/pages/MachineList.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { Link, useNavigate } from "react-router-dom";
import { MachineStatus } from "../../types/machine";
// import { getStatusOperationColor } from "../service/machine";
import { STATUS_COLOR_CLASS } from "../../types/machine";

interface Machine {
  id: string;
  name: string;
  section: string;
  status: MachineStatus;
}

export const MACHINE_STATUS_WORD: Record<MachineStatus, string> = {
  [MachineStatus.OPERATIONAL]: "Beroperasi",
  [MachineStatus.MAINTENANCE]: "Perlu Perawatan",
  [MachineStatus.OUT_OF_SERVICE]: "Tidak Beroperasi",
};

export const getMachineList = () => {
  return useQuery<Machine[]>({
    queryKey: ["listMachine"],
    queryFn: () => apiFetch("machine"),
    maxPages: 5,

    retry: 1,
    staleTime: 0, // force re-fetch immediately
    refetchOnMount: true,
  });
};

export default function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const navigate = useNavigate();

  const { data, error, isLoading } = getMachineList();
  console.log("cek data", data);

  useEffect(() => {
    if (data) {
      setMachines(data);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold py-2 mb-2">Daftar Mesin</h2>
        <button
          className="bg-blue-800 text-white py-2 px-2 rounded hover:bg-blue-700 cursor-pointer mb-2"
          onClick={() => navigate("/machine/add-machine")}
        >
          Register Machine
        </button>
      </div>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="hidden md:block p-2 border">ID Mesin</th>
              <th className="p-2 border">Nama Mesin</th>
              <th className="p-2 border">Section</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Detail</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="hidden md:block p-2 border">{m.id}</td>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.section}</td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 ${
                        STATUS_COLOR_CLASS[m.status]
                      } rounded-full mr-1`}
                    />{" "}
                    {MACHINE_STATUS_WORD[m.status]}
                  </div>
                </td>
                <td className="p-2 border">
                  <Link
                    to={`/machines/${m.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
