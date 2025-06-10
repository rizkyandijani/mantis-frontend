import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type PendingApproval = {
  id: string;
  date: string;
  student: {
    name: string | null;
    email: string;
  };
  machine: {
    name: string;
    unit: string;
  };
};

export default function ApprovalList() {
  const { userId } = useAuth();
  const { data, isLoading, error } = useQuery<PendingApproval[]>({
    queryKey: ["pending-approvals"],
    queryFn: () =>
      apiFetch(
        `maintenance/status/PENDING/approver/${encodeURIComponent(userId!)}`
      ),
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error fetching data</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Pending Daily Maintenance Approvals
      </h1>
      {data && data.length > 0 ? (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Machine</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Student</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="border p-2">{item.machine.name}</td>
                <td className="border p-2">{item.machine.unit}</td>
                <td className="border p-2">
                  {item.student.name || item.student.email}
                </td>
                <td className="border p-2 text-center">
                  <Link
                    to={`/approval/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No pending approvals.</p>
      )}
    </div>
  );
}
