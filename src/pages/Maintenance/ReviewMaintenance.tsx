import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useState } from "react";
import { swal } from "../../libs/swal";
import moment from "moment-timezone";

interface responsesDetail {
  id: string;
  dailyMaintenanceId: string;
  questionId: string;
  answer: boolean;
  evidenceUrl: string;
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
  studentName: string;
  studentId: string;
  responses: responsesDetail[];
}

export default function ReviewMaintenance() {
  const location = useLocation();
  const isDetailMaintenance =
    location.pathname.split("/").filter((el) => !!el)[0] ===
    "detailMaintenance";

  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<maintenanceDetail>({
    queryKey: ["maintenance", id],
    queryFn: () => apiFetch(`maintenance/${id}`),
    enabled: !!id,
  });

  const localTime =
    data?.date &&
    moment(data.date).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");

  const handlePreview = (urlString: string) => {
    setPreviewImage(urlString);
  };

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`maintenance/${id}/updateStatus`, {
        method: "PUT",
        body: JSON.stringify({ note, status }),
      }),
    onSuccess: () => {
      swal.fire({
        icon: "success",
        title: "Berhasil.",
        text: "Daily Maintenance berhasil di review.",
      });
      navigate("/approval");
    },
    onError: (error: any) => {
      console.log("cek error review maintenance", error);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mereview daily maintenance.",
      });
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
        <strong>Submission Time:</strong> {localTime}
      </p>
      <p>
        <strong>Nama Mahasiswa:</strong> {data.studentName}
      </p>
      <p>
        <strong>NIM Mahasiswa:</strong> {data.studentId}
      </p>

      <div className="my-4">
        <h3 className="font-semibold">Checklist Responses:</h3>
        <ul className="list-disc ml-6">
          {data.responses.map((r: any, idx: number) => (
            <li key={idx}>
              <div>
                {r.question.question}:{" "}
                <strong>{r.answer ? "Yes" : "No"}</strong>
              </div>
              <div>
                {"Evidence : "}
                {r.evidenceUrl ? (
                  <img
                    key={`${r.id}-evidenceImage`}
                    src={r.evidenceUrl}
                    alt="preview"
                    className="h-20 w-20 object-cover mt-2 border cursor-pointer"
                    onClick={() => handlePreview(r.evidenceUrl)}
                  />
                ) : (
                  "No evidence provided"
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!isDetailMaintenance && (
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

            {/* <button
            onClick={() => {
              setStatus("REJECTED");
              mutation.mutate();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button> */}
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <button
              className="absolute top-0 right-0 text-white bg-red-600 text-2xl rounded-sm p-2"
              onClick={() => setPreviewImage(null)}
            >
              &times;
            </button>
            <img
              src={previewImage}
              alt="zoom preview"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
