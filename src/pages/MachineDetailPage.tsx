// src/pages/MachineDetailPage.tsx
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { useEffect, useState } from "react";
import { MachineData } from "../types/machine";
import { useNavigate } from "react-router-dom";

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
      alert("Update Machine Status success.");
      navigate("/machine");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ status, comment });
  };

  if (isLoading) return <p>Loading...</p>;
  if (!machine) return <p>Machine not found</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Detail Mesin: {machine.name}</h2>
      <p>Section: {machine.section}</p>
      <p>
        Status Saat Ini: <strong>{machine.status}</strong>
      </p>

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
