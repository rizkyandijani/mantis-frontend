// src/pages/ApprovalPage.tsx
import { useState } from "react";

interface Submission {
  id: number;
  studentName: string;
  machineId: string;
  submittedAt: string;
  checklistSummary: string;
}

export default function ApprovalPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      studentName: "Rizky A.",
      machineId: "ML-01",
      submittedAt: "2025-06-03",
      checklistSummary: "Oil OK, Coolant OK, Noise Detected",
    },
  ]);

  const handleAction = (id: number, approved: boolean, comment: string) => {
    console.log(approved ? "Approved" : "Rejected", id, comment);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Approval Checklist Mahasiswa
      </h2>
      {submissions.map((entry) => (
        <div key={entry.id} className="border p-4 mb-4 rounded-md shadow">
          <div className="mb-2 font-medium">
            {entry.studentName} - Mesin {entry.machineId}
          </div>
          <div className="text-sm mb-2">
            Checklist: {entry.checklistSummary}
          </div>
          <div className="text-sm mb-2">Tanggal: {entry.submittedAt}</div>
          <textarea
            placeholder="Komentar..."
            className="w-full border p-2 mb-2"
          ></textarea>
          <div className="space-x-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleAction(entry.id, true, "Disetujui")}
            >
              Approve
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => handleAction(entry.id, false, "Perlu diperbaiki")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
