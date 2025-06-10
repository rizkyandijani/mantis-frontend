import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { useState } from "react";

interface responsesDetail {
  id: string;
  dailyMaintenanceId: string;
  questionId: string;
  answer: boolean;
}

interface machineDetail {
  id: string;
  name: string;
  type: string;
  section: string;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface studentDetail {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface maintenanceDetail {
  id: string;
  date: string;
  dateOnly: string;
  machineId: string;
  studentEmail: string;
  approvedById: string;
  approvedAt: string;
  status: string;
  approvalNote: string;
  machine: machineDetail;
  student: studentDetail;
  responses: responsesDetail[];
}

export default function ReviewMaintenance() {
  console.log("masuk review Maintenance");
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");

  const { data, isLoading, isError } = useQuery<maintenanceDetail>({
    queryKey: ["maintenance", id],
    queryFn: () => apiFetch(`maintenance/${id}`),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`maintenance/${id}/updateStatus`, {
        method: "PUT",
        body: JSON.stringify({ note, status }),
      }),
    onSuccess: () => {
      alert("Submission reviewed.");
      navigate("/approval");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError)
    return <p>Something went wrong while fetching maintenance details...</p>;
  if (!data) return <p>Maintenance not found</p>;

  return (
    <div className="p-6">
      <h2 className="atext-xl font-semibold mb-4">Review Maintenance</h2>
      <p>
        <strong>Machine:</strong> {data.machine?.name}
      </p>
      <p>
        <strong>Date:</strong> {new Date(data.dateOnly).toLocaleDateString()}
      </p>
      <p>
        <strong>Student:</strong> {data.student?.name}
      </p>

      <div className="my-4">
        <h3 className="font-semibold">Checklist Responses:</h3>
        <ul className="list-disc ml-6">
          {data.responses.map((r: any, idx: number) => (
            <li key={idx}>
              {r.question.question}: <strong>{r.answer ? "Yes" : "No"}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <label className="block mb-1">Approval Note:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4"
        />

        <div className="flex gap-4">
          <button
            onClick={() => {
              setStatus("APPROVED");
              mutation.mutate();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve
          </button>

          <button
            onClick={() => {
              setStatus("REJECTED");
              mutation.mutate();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
