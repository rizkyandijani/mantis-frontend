// src/pages/QuestionForm.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { UserData } from "../types/user";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";

interface Machine {
  id: string;
  name: string;
  type: string; // misal "BUBUT", "FRAIS", dst
}

interface Question {
  id: number;
  order: number;
  question: string; //
  isActive: boolean;
}

interface Answer {
  questionId: string;
  answer: boolean;
}

interface QuestionPayload {
  studentEmail: string;
  instructorId: string;
  machineId: string;
  responses: Answer[];
}

export default function QuestionForm() {
  const qc = useQueryClient();
  const { machineId: paramMachineId } = useParams();
  const { email } = useAuth();

  // 1) State dasar
  const [studentEmail, setStudentEmail] = useState(email || "");
  const [instructor, setInstructor] = useState("");
  const [machineId, setMachineId] = useState(paramMachineId ?? "");

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
    queryFn: () => apiFetch("user/role/instructor"),
  });

  // 4) Fetch pertanyaan tiap kali machineId berubah
  const machineType = machines?.find((m) => m.id === machineId)?.type;
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
      alert("Question berhasil dikirim!");
      setAnswers({});
      setInstructor("");
      setMachineId("");

      // … reset your state here …
    },
    onError: (err: any) => {
      console.log("cek error", err);
      alert("Gagal submit: " + err.message);
    },
  });

  // 7) Handler perubahan
  const handleAnswerChange = (key: number, checked: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = () => {
    if (!studentEmail || !instructor || !machineId) {
      alert("Lengkapi nama mahasiswa, instruktur, dan mesin.");
      return;
    }
    const ArrayAnswers = Object.keys(answers).map((el) => {
      return {
        questionId: el,
        answer: answers[el],
      };
    });
    mutation.mutate({
      studentEmail,
      instructorId: instructor,
      machineId,
      responses: ArrayAnswers,
    });
  };

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
        value={studentEmail}
        disabled={!!email} // disable if email is already set
        onChange={(e) => setStudentEmail(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-4"
        placeholder="Masukkan nama..."
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
            {m.name} ({m.type})
          </option>
        ))}
      </select>

      {/* Question Dinamis */}
      {questions && questions.length > 0 && (
        <fieldset className="mb-6">
          <legend className="font-medium mb-2">
            Pertanyaan untuk {machineType}
          </legend>
          <div className="space-y-2">
            {questions.map((q) => (
              <label key={q.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={answers[q.id] || false}
                  onChange={(e) => handleAnswerChange(q.id, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span>{q.question}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending ? "Mengirim…" : "Submit Answer"}
      </button>
    </div>
  );
}
