// src/components/MachineForm.tsx
import { useState, useEffect, use } from "react";
import { apiFetch } from "../libs/api";
import { MachineData, MachineType } from "../types/machine";
import { swal } from "../libs/swal";
import { useNavigate } from "react-router-dom";

interface MachineFormProps {
  machineId?: string;
  onSuccess: () => void;
  machine?: MachineData;
}

export default function MachineForm({
  machineId,
  onSuccess,
  machine,
}: MachineFormProps) {
  console.log("cek machineData form", machine);
  const navigate = useNavigate();
  const isEdit = !!machineId;
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [unit, setUnit] = useState("");
  const [type, setType] = useState<MachineType>(MachineType.BUBUT);

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setSection(machine.section);
      setUnit(machine.unit);
      setType(machine.type);
    }
  }, [machine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, section, unit, type };
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `machine/${machineId}` : "machine";

    try {
      apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      }).then((machine) => {
        swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Berhasil ${isEdit ? "Mengedit" : "Menambahkan"} Mesin`,
        });
        setName("");
        setSection("");
        setUnit("");
        setType(MachineType.BUBUT);
        onSuccess();
      });
    } catch (error) {
      console.log("cek error add edit machine", error);
      swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Tidak Berhasil ${isEdit ? "Mengedit" : "Menambahkan"} Mesin.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Mesin"
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        value={section}
        onChange={(e) => setSection(e.target.value)}
        placeholder="Section"
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder="Unit"
        required
        className="w-full border px-3 py-2 rounded"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as MachineType)}
        className="w-full border px-3 py-2 rounded"
      >
        {Object.values(MachineType).map((type, index) => (
          <option key={index} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Tambah"} Mesin
      </button>
    </form>
  );
}
