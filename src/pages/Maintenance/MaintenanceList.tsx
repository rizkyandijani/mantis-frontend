// src/pages/ApprovedMaintenanceList.tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { DailyMaintenanceStatus } from "../../types/maintenance";
import { MAINTENANCE_STATUS_COLORS } from "../../types/maintenance";

interface Maintenance {
  id: string;
  date: Date;
  dateOnly: string;
  machine: { name: string };
  studentEmail: string;
  approvedById: string;
  approvedBy: { name: string };
  approvalNote?: string;
  status?: DailyMaintenanceStatus;
  response: { question: string; answer: boolean }[];
}

export default function MaintenanceList() {
  const { data, isLoading, error } = useQuery<Maintenance[]>({
    queryKey: ["MaintenanceSubmissionsList"],
    queryFn: () => apiFetch("maintenance"),
  });

  console.log("cek data Maintenance List", data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Maintenance</h2>
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Machine</th>
            <th className="border p-2">Student</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.dateOnly}</td>
              <td className="border p-2">{item.machine.name}</td>
              <td className="border p-2">{item.studentEmail}</td>
              <td
                className={`border p-2 ${
                  item.status
                    ? MAINTENANCE_STATUS_COLORS[item.status]
                    : "text-grey-500"
                }`}
              >
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
