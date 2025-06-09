// src/pages/ChecklistForm.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";

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

interface ChecklistPayload {
  studentName: string;
  instructor: string;
  machineId: string;
  answers: Record<string, boolean>;
}

export default function ChecklistForm() {
  const qc = useQueryClient();

  // 1) State dasar
  const [studentName, setStudentName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [machineId, setMachineId] = useState("");

  // answers akan dinamis: kuncinya dari pertanyaan
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // 2) Fetch mesin
  const { data: machines, isLoading: loadingMachines } = useQuery<Machine[]>({
    queryKey: ["machines"],
    queryFn: () => apiFetch("machine"),
  });

  // 3) Fetch instruktur (atau bisa static jika belum ada API)
  // const { data: instructors, isLoading: loadingInstr } = useQuery<string[]>({
  //   queryKey: ["instructors"],
  //   queryFn: () => apiFetch("http://localhost:8080/api/instructor"),
  // });
  const loadingInstr = false; // set loadingInstr ke false jika tidak ada API
  const instructors = [
    { name: "Instruktur A", id: 123 },
    { name: "Instruktur B", id: 234 },
  ]; // contoh data statis

  // 4) Fetch pertanyaan/checklist tiap kali machineId berubah
  const machineType = machines?.find((m) => m.id === machineId)?.type;
  const {
    data: questions,
    isLoading: loadingQuestions,
    refetch: refetchQuestions,
  } = useQuery<Question[]>({
    enabled: !!machineType,
    queryKey: ["checklist", machineType],
    // hanya fetch jika machineType sudah ada
    queryFn: () =>
      apiFetch(
        `http://localhost:8080/api/checklistTemplate/byType/${encodeURIComponent(
          machineType!
        )}`
      ),
  });

  // 5) Inisialisasi answers tiap kali questions datang
  useEffect(() => {
    console.log("cek questions", questions);
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
    // 1) mutationFn taking ChecklistPayload and returning whatever your apiFetch returns
    mutationFn: (payload: ChecklistPayload) =>
      apiFetch("checklist", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    // 2) onSuccess no longer needs generics—TS infers it
    onSuccess: () => {
      // invalidateQueries needs an object with a `queryKey` property
      qc.invalidateQueries({ queryKey: ["userChecklistHistory"] });
      alert("Checklist berhasil dikirim!");
      // … reset your state here …
    },
    onError: (err: any) => {
      alert("Gagal submit: " + err.message);
    },
  });

  // 7) Handler perubahan
  const handleAnswerChange = (key: number, checked: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = () => {
    if (!studentName || !instructor || !machineId) {
      alert("Lengkapi nama mahasiswa, instruktur, dan mesin.");
      return;
    }
    mutation.mutate({
      studentName,
      instructor,
      machineId,
      answers,
    });
  };

  // 8) Render
  if (loadingMachines || loadingInstr) return <p>Loading form data...</p>;
  if (machineType && loadingQuestions)
    return <p>Loading checklist untuk mesin {machineType}…</p>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">
        Checklist Perawatan Harian
      </h2>

      {/* Nama Mahasiswa */}
      <label className="block mb-1 font-medium">Nama Mahasiswa</label>
      <input
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
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

      {/* Checklist Dinamis */}
      {questions && questions.length > 0 && (
        <fieldset className="mb-6">
          <legend className="font-medium mb-2">
            Checklist untuk {machineType}
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
        {mutation.isPending ? "Mengirim…" : "Submit Checklist"}
      </button>
    </div>
  );
}
