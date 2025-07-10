import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useState } from "react";
import { swal } from "../../libs/swal";
import moment from "moment-timezone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface responsesDetail {
  id: string;
  dailyMaintenanceId: string;
  questionId: string;
  answer: boolean;
  evidenceUrl: string;
  question?: { question: string };
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
  approvedBy?: { name: string };
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

  // Track loading state for each evidence image
  const [imageLoading, setImageLoading] = useState<{ [id: string]: boolean }>({});
  // Track PDF generation loading state
  const [pdfLoading, setPdfLoading] = useState(false);

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

  // PDF Export Handler
  const handleExportPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      // Title
      doc.setFontSize(16);
      doc.text("Maintenance Submission Report", 14, 16);
      // Info
      doc.setFontSize(11);
      let y = 26;
      doc.text(`Machine: ${data.machine?.name || "-"}`, 14, y);
      y += 7;
      doc.text(`Submission Time: ${localTime || "-"}`, 14, y);
      y += 7;
      doc.text(`Nama Mahasiswa: ${data.studentName || "-"}`, 14, y);
      y += 7;
      doc.text(`NIM Mahasiswa: ${data.studentId || "-"}`, 14, y);
      y += 7;
      if (data.approvalNote) {
        doc.text(`Approval Comment: ${data.approvalNote}`, 14, y);
        y += 7;
      }
      // Checklist Table
      autoTable(doc, {
        startY: y,
        head: [["Checklist", "Answer"]],
        body: data.responses.map((r) => [r.question?.question || "", r.answer ? "Yes" : "No"]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
      // Evidence Images
      for (const r of data.responses) {
        if (r.evidenceUrl) {
          try {
            const imgBlob = await fetch(r.evidenceUrl).then(res => res.blob());
            const imgData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(imgBlob);
            });
            doc.setFontSize(11);
            doc.text(`Evidence for: ${r.question?.question || ""}`, 14, y);
            y += 3;
            const imgProps = (doc as any).getImageProperties(imgData);
            const maxWidth = 170;
            const maxHeight = 80;
            let width = imgProps.width;
            let height = imgProps.height;
            if (width > maxWidth) {
              height = (maxWidth / width) * height;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (maxHeight / height) * width;
              height = maxHeight;
            }
            doc.addImage(imgData, 'JPEG', 14, y, width, height);
            y += height + 10;
            if (y > 250) {
              doc.addPage();
              y = 20;
            }
          } catch (e) {
            // If image fails, skip
          }
        }
      }
      doc.save(`maintenance_report_${data.id}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError)
    return <p>Something went wrong while fetching maintenance details...</p>;
  if (!data) return <p>Maintenance not found</p>;

  // Get query string for back navigation
  const queryString = location.search;

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          className="text-blue-600 hover:underline mb-2"
          onClick={() => navigate(`/maintenaceSubmissionList${queryString}`)}
        >
          ← Back to List
        </button>
        <button
          className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleExportPDF}
          disabled={pdfLoading || data?.status !== 'APPROVED'}
          title={data?.status !== 'APPROVED' ? 'Export only available after approval' : undefined}
        >
          {pdfLoading ? (
            <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Generating PDF...</span>
          ) : (
            "Export to PDF"
          )}
        </button>
      </div>
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
      <p>
        <strong>Approver:</strong> {data.approvedById && data.approvedById !== 'null' && data.approvedById !== '' && data.approvedBy ? data.approvedBy.name : '-'}
      </p>

      {/* Show approval comment if present */}
      {data.approvalNote && (
        <div className="my-4 p-3 bg-blue-50 border-l-4 border-blue-400">
          <strong>Approval Comment:</strong>
          <div className="mt-1 whitespace-pre-line">{data.approvalNote}</div>
        </div>
      )}

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
                  <div className="relative h-20 w-20 mt-2">
                    {imageLoading[r.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                        <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      </div>
                    )}
                    <img
                      key={`${r.id}-evidenceImage`}
                      src={r.evidenceUrl}
                      alt="preview"
                      className="h-20 w-20 object-cover border cursor-pointer"
                      onClick={() => handlePreview(r.evidenceUrl)}
                      onLoad={() => setImageLoading(l => ({ ...l, [r.id]: false }))}
                      onError={() => setImageLoading(l => ({ ...l, [r.id]: false }))}
                      style={{ display: imageLoading[r.id] === false ? 'block' : 'none' }}
                    />
                    {/* Set loading true on mount */}
                    {imageLoading[r.id] === undefined && setTimeout(() => setImageLoading(l => ({ ...l, [r.id]: true })), 0)}
                  </div>
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
