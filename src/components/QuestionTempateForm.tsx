// src/components/QuestionTemplateForm.tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../libs/api";
import { swal } from "../libs/swal";
import { MachineType } from "../types/machine";

interface Props {
  templateId?: string;
  templateData?: {
    question: string;
    isActive: boolean;
    order: number;
    machineType: MachineType;
  };
  onSuccess: () => void;
}

export default function QuestionTemplateForm({
  templateId,
  templateData,
  onSuccess,
}: Props) {
  const isEdit = !!templateId;
  const [question, setQuestion] = useState("");
  const [isActive, setActivate] = useState<boolean>(true);
  const [order, setOrder] = useState<number>(1);
  const [mcType, setMachineType] = useState<MachineType>(MachineType.BUBUT);

  useEffect(() => {
    if (templateData) {
      console.log("cek template data", templateData);
      setQuestion(templateData.question);
      setActivate(templateData.isActive);
      setOrder(templateData.order);
      setMachineType(templateData.machineType);
    }
  }, [templateData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { question, isActive, order, machineType: mcType };
    console.log("cek payload", payload);
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `questionTemplate/${templateId}` : "questionTemplate";

    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      swal.fire({
        icon: "success",
        title: "Success",
        text: `Successfully ${isEdit ? "updated" : "added"} question template.`,
      });
      setQuestion("");
      onSuccess();
    } catch (err) {
      swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${isEdit ? "update" : "add"} question template.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Activate?</label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setActivate(e.target.checked)}
          className="mr-2 h-4 w-4 text-blue-600"
        />
      </div>
      <div>
        <label className="block mb-1">Order</label>
        <input
          type="number"
          min={0}
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value))}
          className="w-20 px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Tipe Mesin</label>
        <select
          value={mcType}
          onChange={(e) => setMachineType(e.target.value as MachineType)}
          className="w-full border px-3 py-2 rounded"
        >
          {Object.values(MachineType).map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Add"} Question
      </button>
    </form>
  );
}
