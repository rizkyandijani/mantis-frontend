// src/pages/MachineDetailPage.tsx
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useEffect, useState } from "react";
import { MachineData } from "../../types/machine";
import { useNavigate } from "react-router-dom";
import { swal } from "../../libs/swal";
import { MACHINE_STATUS_WORD } from "./MachineList";
import { STATUS_COLOR_CLASS } from "../../types/machine";
// import { getStatusOperationColor } from "../service/machine";

export default function MachineDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["machineDetail", id],
    queryFn: (): Promise<MachineData> => apiFetch(`machine/byId/${id}`),
  });

  console.log("cek response data", data);

  const [status, setStatus] = useState("OPERATIONAL");
  const [comment, setComment] = useState("");
  const [machine, setMachine] = useState<MachineData | undefined>(undefined);

  useEffect(() => {
    setMachine(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch(`machine/${id}/log`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Update Machine Status success!",
      });
      navigate("/machines");
    },
    onError: (error: any) => {
      console.log("cek error update machine status", error);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Update Machine Status Failed!",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ status, comment });
  };

  if (isLoading) return <p>Loading...</p>;
  if (!machine) return <p>Machine not found</p>;

  console.log("cek machine status", machine.status);
  console.log("cek machine status color", STATUS_COLOR_CLASS[machine.status]);
  return (
    <div className="p-4">
      <div className="flex">
        <div>
          <h2 className="text-xl font-bold">Detail Mesin:</h2>
          <table className="table-auto w-full border">
            <tbody>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID Mesin</th>
                <td className="p-2 border">{machine.id}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID Inventaris Mesin</th>
                <td className="p-2 border">{machine.inventoryId}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Nama Mesin</th>
                <td className="p-2 border">{machine.name}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Section</th>
                <td className="p-2 border">{machine.section}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Unit Kerja</th>
                <td className="p-2 border">{machine.unit}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Kelompok Mesin</th>
                <td className="p-2 border">{machine.machineGroup}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Jenis Umum Mesin</th>
                <td className="p-2 border">{machine.machineCommonType}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Jenis Spesifik Mesin</th>
                <td className="p-2 border">{machine.machineSpecificType}</td>
              </tr>
              <tr className="bg-gray-100">
                <th className="p-2 border">Status Mesin</th>
                <td className="p-2 border">
                  {machine.status && (
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 ${
                          STATUS_COLOR_CLASS[machine.status]
                        } rounded-full mr-1`}
                      />{" "}
                      {MACHINE_STATUS_WORD[machine.status]}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            className="bg-blue-800 my-1 text-white py-1 px-1 rounded hover:bg-blue-700 cursor-pointer"
            onClick={() => navigate("/machine/edit-machine/" + machine.id)}
          >
            Edit Detail Mesin
          </button>
        </div>
      </div>

      <h3 className="mt-6 font-semibold">Log Terakhir</h3>
      <ul className="list-disc ml-6">
        {machine.statusLogs.slice(0, 5).map((log: any) => (
          <li key={log.id}>
            [{log.createdAt.slice(0, 10)}] {log.oldStatus} → {log.newStatus} -{" "}
            {log.comment}
          </li>
        ))}
      </ul>

      <h3 className="mt-6 font-semibold">Update Status</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="OPERATIONAL">Operational</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
        <textarea
          placeholder="Komentar"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border w-full p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Simpan Log dan Status
        </button>
      </form>
    </div>
  );
}
