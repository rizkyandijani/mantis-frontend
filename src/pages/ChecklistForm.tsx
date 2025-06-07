// src/pages/ChecklistForm.tsx
import { useState } from "react";

export default function ChecklistForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    instructor: "",
    machineId: "",
    checklist: {
      oilCheck: false,
      coolantLevel: false,
      cleanliness: false,
      abnormalNoise: false,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name in formData.checklist) {
      setFormData({
        ...formData,
        checklist: {
          ...formData.checklist,
          [name]: checked,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    // submit to API
    console.log("Submitted:", formData);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Checklist Perawatan Harian</h2>

      <label className="block mb-2">Nama Mahasiswa</label>
      <input
        name="studentName"
        className="w-full border mb-4 p-2"
        onChange={handleChange}
      />

      <label className="block mb-2">Nama Instruktur</label>
      <select
        name="instructor"
        className="w-full border mb-4 p-2"
        onChange={handleChange}
      >
        <option value="">Pilih Instruktur</option>
        <option value="Instruktur A">Instruktur A</option>
        <option value="Instruktur B">Instruktur B</option>
      </select>

      <label className="block mb-2">ID Mesin</label>
      <input
        name="machineId"
        className="w-full border mb-4 p-2"
        onChange={handleChange}
      />

      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Checklist</legend>
        {Object.keys(formData.checklist).map((key) => (
          <label key={key} className="block">
            <input
              type="checkbox"
              name={key}
              checked={
                formData.checklist[key as keyof typeof formData.checklist]
              }
              onChange={handleChange}
              className="mr-2"
            />
            {key}
          </label>
        ))}
      </fieldset>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Checklist
      </button>
    </div>
  );
}
