// src/pages/QuestionTemplateList.tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useNavigate } from "react-router-dom";
import { MachineType } from "../../types/machine";

interface QuestionTemplate {
  id: string;
  question: string;
  isActive: boolean;
  order: number;
  machineType: MachineType;
}

export default function QuestionTemplateList() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<QuestionTemplate[]>({
    queryKey: ["questionTemplateList"],
    queryFn: () => apiFetch("questionTemplate"),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Question Templates</h2>
      <button
        className="bg-blue-800 text-white py-2 px-2 rounded hover:bg-blue-700 cursor-pointer mb-2"
        onClick={() => navigate("/question/add-template")}
      >
        Add Question Template
      </button>
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Active</th>
            <th className="border p-2">Question</th>
            <th className="border p-2">Machine Type</th>
            <th className="border p-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.isActive ? "Ya" : "Tidak"}</td>
              <td className="border p-2">{item.question}</td>
              <td className="border p-2">{item.machineType}</td>
              <td className="border p-2">
                <a
                  href={`/question/edit-template/${item.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
