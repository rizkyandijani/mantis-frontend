// src/components/MachineForm.tsx
import { useState, useEffect, use } from "react";
import { apiFetch } from "../libs/api";
import { MachineData, MachineType } from "../types/machine";
import { swal } from "../libs/swal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
  const {
    data: machineTypes,
    isLoading: loadingMachineTypes,
    isError: errorMachineTypes,
  } = useQuery<string[]>({
    enabled: true,
    queryKey: ["getALLMachineType"],
    // fetch available machine type
    queryFn: () => apiFetch(`machineTypes`),
  });

  console.log("cek machineData form", machine);
  const navigate = useNavigate();
  const isEdit = !!machineId;
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [unit, setUnit] = useState("");
  const [commonType, setCommonType] = useState("");
  const [specificType, setSpecificType] = useState("");
  const [machineGroup, setMachineGroup] = useState("");
  const [inventoryId, setInventoryId] = useState("");

  useEffect(() => {
    if (machine) {
      setName(machine.name);
      setSection(machine.section);
      setUnit(machine.unit);
      setCommonType(machine.machineCommonType);
      setSpecificType(machine.machineSpecificType);
      setMachineGroup(machine.machineGroup);
      setInventoryId(machine.inventoryId);
    }
  }, [machine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      section,
      unit,
      commonType,
      specificType,
      inventoryId,
      machineGroup,
    };
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
        setCommonType("");
        setMachineGroup("");
        setSpecificType("");
        setInventoryId("");
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
      <div>
        <label className="block mb-1">ID Asset Mesin</label>
        <input
          value={inventoryId}
          onChange={(e) => setInventoryId(e.target.value)}
          placeholder="ID Asset Mesin"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Nama Mesin</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Mesin"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Section</label>
        <input
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Section"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Unit Kerja</label>
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">{`Jenis Umum Mesin: (Contoh: Lathe Machine, Milling Machine, Prototyping)`}</label>
        {loadingMachineTypes && <span>Loading Opsi Jenis Umum Mesin..</span>}
        {!loadingMachineTypes &&
          (machineTypes?.length === 0 || errorMachineTypes) && (
            <input
              value={commonType}
              onChange={(e) => setCommonType(e.target.value)}
              placeholder="Jenis Umum Mesin"
              required
              className="w-full border px-3 py-2 rounded"
            />
          )}
        {!loadingMachineTypes &&
          machineTypes?.length &&
          machineTypes?.length > 0 && (
            <select
              value={commonType}
              onChange={(e) => {
                setCommonType(e.target.value);
              }}
              className="w-full border border-gray-300 rounded p-2 mb-1"
            >
              {machineTypes?.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
      </div>
      <div>
        <label className="block mb-1">{`Jenis Spesifik (Type) Mesin: (Contoh: CNC, Manual, 3D Print SLA)`}</label>
        <input
          value={specificType}
          onChange={(e) => setSpecificType(e.target.value)}
          placeholder="Jenis Spesifik Mesin"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Kelompok Mesin</label>
        <input
          value={machineGroup}
          onChange={(e) => setMachineGroup(e.target.value)}
          placeholder="Kelompok Mesin"
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Update" : "Tambah"} Mesin
      </button>
    </form>
  );
}
