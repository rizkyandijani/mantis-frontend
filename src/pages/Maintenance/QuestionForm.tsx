// src/pages/QuestionForm.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, uploadEvidenceFile } from "../../libs/api";
import { UserData } from "../../types/user";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { swal } from "../../libs/swal";
import { EvidenceState } from "../../types/question";

interface Machine {
  id: string;
  name: string;
  machineCommonType: string; // misal "BUBUT", "FRAIS", dst
}

interface Question {
  id: string;
  order: number;
  question: string; //
  isActive: boolean;
}

interface Answer {
  questionId: string;
  answer: boolean;
}

interface QuestionPayload {
  studentName: string;
  studentId: string;
  instructorId: string;
  machineId: string;
  responses: Answer[];
}

export default function QuestionForm() {
  const { token, role } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { machineId: paramMachineId } = useParams();
  // const { email } = useAuth();

  // 1) State dasar
  // const [studentEmail, setStudentEmail] = useState(email || "");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [instructor, setInstructor] = useState("");
  const [machineId, setMachineId] = useState(paramMachineId ?? "");
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceState>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // answers akan dinamis: kuncinya dari pertanyaan
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // 2) Fetch mesin
  const { data: machines, isLoading: loadingMachines } = useQuery<Machine[]>({
    queryKey: ["machines"],
    queryFn: () => apiFetch("machine"),
  });

  // 3) Fetch instruktur (atau bisa static jika belum ada API)
  const { data: instructors, isLoading: loadingInstr } = useQuery<UserData[]>({
    queryKey: ["instructors"],
    queryFn: () => apiFetch("user/instructors"),
  });

  // 4) Fetch pertanyaan tiap kali machineId berubah
  const machineType = machines?.find(
    (m) => m.id === machineId
  )?.machineCommonType;
  const {
    data: questions,
    isLoading: loadingQuestions,
    refetch: refetchQuestions,
  } = useQuery<Question[]>({
    enabled: !!machineType,
    queryKey: ["question", machineType],
    // hanya fetch jika machineType sudah ada
    queryFn: () =>
      apiFetch(`questionTemplate/byType/${encodeURIComponent(machineType!)}`),
  });

  // 5) Inisialisasi answers tiap kali questions datang
  useEffect(() => {
    if (questions) {
      const init: Record<string, boolean> = {};
      questions.forEach((q) => {
        init[q.id] = false;
      });
      setAnswers(init);
    }
  }, [questions]);

  // 6) Mutation untuk submit
  const mutation = useMutation({
    // 1) mutationFn taking QuestionPayload and returning whatever your apiFetch returns
    mutationFn: (payload: QuestionPayload) =>
      apiFetch("maintenance", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    // 2) onSuccess no longer needs generics—TS infers it
    onSuccess: () => {
      // invalidateQueries needs an object with a `queryKey` property
      qc.invalidateQueries({ queryKey: ["userQuestionHistory"] });
      swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Daily Maintenance berhasil diinput.",
      });
      setAnswers({});
      setInstructor("");
      setMachineId("");
      setStudentId("");
      setStudentName("");
      if (token) {
        navigate("/student/my-maintenance");
      } else {
        navigate("/login");
      }

      // … reset your state here …
    },
    onError: (err: any) => {
      console.log("err di questionsubmit", err);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message ?? "Daily Maintenance gagal diinput.",
      });
    },
  });

  // 7) Handler perubahan
  const handleAnswerChange = (key: string, checked: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: checked }));
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    questionId: string
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const isValidSize = file.size <= 5 * 1024 * 1024; // max 5MB
    const isValidType = ["image/jpeg", "image/png"].includes(file.type);

    if (!isValidSize || !isValidType) {
      swal.fire({
        icon: "error",
        title: "File Tidak Valid",
        text: "Hanya gambar JPG/PNG maksimal 5MB yang diperbolehkan.",
      });
      return;
    }

    setEvidenceFiles((prev) => ({
      ...prev,
      [questionId]: { file, progress: 0, status: "idle" },
    }));
  };

  const retryUpload = async (questionId: string) => {
    const file = evidenceFiles[questionId]?.file;
    if (!file) return;
    await uploadEvidenceFile(questionId, file, setEvidenceFiles);
  };

  const handleSubmit = async () => {
    if (!studentId || !studentName || !instructor || !machineId) {
      swal.fire({
        icon: "error",
        title: "Tidak Lengkap",
        text: "Lengkapi nama mahasiswa, NIM Mahasiswa, instruktur, dan mesin.",
      });
      return;
    }

    try {
      const answersWithEvidence = await Promise.all(
        Object.entries(answers).map(async ([questionId, answer]) => {
          const evidence = evidenceFiles[questionId];
          const fileStatus = evidenceFiles[questionId]?.status;
          const file = evidenceFiles[questionId]?.file;
          let evidenceUrl = "";
          if (evidence && fileStatus !== "success" && file) {
            evidenceUrl = await uploadEvidenceFile(
              questionId,
              file,
              setEvidenceFiles
            );
          }
          console.log("cek evidence url after upload", evidenceUrl);
          return {
            questionId,
            answer,
            evidenceUrl,
          };
        })
      );
      // 1. Submit daily maintenance answers
      const result = await mutation.mutateAsync({
        studentName,
        studentId,
        instructorId: instructor,
        machineId,
        responses: answersWithEvidence,
      });
      console.log("cek result submit", result);

      // const questionResponses = (result as any).data?.questionResponses || [];

      // 2. Upload evidence files for each question response
      // for (const qr of questionResponses) {
      //   const questionId = qr.questionId;
      //   const responseId = qr.id;

      //   if (evidenceFiles[questionId]) {
      //     const QuestionEvidenceImage = evidenceFiles[questionId].file;
      //     const formData = new FormData();
      //     formData.append("file", QuestionEvidenceImage);
      //     formData.append("questionResponseId", responseId);

      //     await fetch("/api/evidence", {
      //       method: "POST",
      //       body: formData,
      //     });
      //   }
      // }

      swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Checklist dan evidence berhasil dikirim!",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error during submission:", error);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengirim data.",
      });
    }
  };

  const isUploadingEvidence = Object.values(evidenceFiles).some(
    (f) => f.status === "uploading"
  );

  // 8) Render
  if (loadingMachines || loadingInstr) return <p>Loading form data...</p>;
  if (machineType && loadingQuestions)
    return <p>Loading pertanyaan untuk mesin {machineType}…</p>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">
        Pertanyaan Perawatan Harian
      </h2>

      {/* Nama Mahasiswa */}
      <label className="block mb-1 font-medium">Nama Mahasiswa</label>
      <input
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-4"
        placeholder="Masukkan nama..."
      />

      {/* NIM Mahasiswa */}
      <label className="block mb-1 font-medium">NIM Mahasiswa</label>
      <input
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-4"
        placeholder="Masukkan Nomor Induk Mahasiswa..."
      />

      {/* Instruktur */}
      <label className="block mb-1 font-medium">Nama Instruktur</label>
      <select
        value={instructor}
        onChange={(e) => setInstructor(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-4"
      >
        <option value="">Pilih Instruktur</option>
        {instructors!.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {/* Mesin */}
      <label className="block mb-1 font-medium">Pilih Mesin</label>
      <select
        disabled={!!paramMachineId}
        value={machineId}
        onChange={(e) => {
          setMachineId(e.target.value);
          setAnswers({});
          refetchQuestions();
        }}
        className="w-full border border-gray-300 rounded p-2 mb-6"
      >
        <option value="">Pilih Mesin</option>
        {machines!.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.machineCommonType})
          </option>
        ))}
      </select>

      {/* Question Dinamis */}
      {questions && questions.length > 0 && (
        <fieldset className="mb-6">
          <legend className="font-medium mb-1">
            Pertanyaan untuk {machineType}
          </legend>
          <label className="text-md mb-1 text-red-500">
            *Lakukan checklist box pada pertanyaan dibawah, apabila kondisi
            sesuai.
          </label>
          <div className="space-y-2">
            {questions.map((q) => (
              <label key={q.id} className="block">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={answers[q.id] || false}
                    onChange={(e) => handleAnswerChange(q.id, e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span>{q.question}</span>
                </div>
                <div className="block items-center">
                  {evidenceFiles[q.id] ? (
                    <div>
                      <img
                        key={`${q.id}-evidenceImage`}
                        src={URL.createObjectURL(evidenceFiles[q.id].file)}
                        alt="preview"
                        className="h-20 w-20 object-cover mt-2 border cursor-pointer"
                        onClick={() => handlePreview(evidenceFiles[q.id].file)}
                      />
                      {evidenceFiles[q.id].status === "uploading" && (
                        <div>
                          <span>{"Uploading Evidence.."}</span>
                          <progress
                            value={evidenceFiles[q.id].progress}
                            max="100"
                            className="w-full"
                          ></progress>
                        </div>
                      )}
                      {evidenceFiles[q.id].status === "error" && (
                        <div>
                          <p className="text-red-500">
                            {evidenceFiles[q.id].error}
                          </p>
                          <button
                            onClick={() => retryUpload(q.id)}
                            className="text-blue-700 underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                      {evidenceFiles[q.id].status === "success" && (
                        <p className="text-green-600">Uploaded ✅</p>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="relative inline-block my-2">
                    <input
                      type="file"
                      className="file:bg-blue-500 file:text-white file:border-0
                      file:py-1 file:px-3 file:rounded-full
                      file:shadow-xl file:shadow-blue-500/30
                      text-gray-600"
                      onChange={(e) => handleFileChange(e, q.id)}
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending || isUploadingEvidence}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending
          ? "Mengirim…"
          : isUploadingEvidence
          ? "Uploading Evidence.."
          : "Submit Answer"}
      </button>
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
