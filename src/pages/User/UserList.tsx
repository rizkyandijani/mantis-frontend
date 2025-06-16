// src/pages/ApprovedMaintenanceList.tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { UserData } from "../../types/user";
import { useNavigate } from "react-router-dom";

export default function UserList() {
  const { data, isLoading, error } = useQuery<UserData[]>({
    queryKey: ["UserLists"],
    queryFn: () => apiFetch("user"),
  });
  const navigate = useNavigate();

  console.log("cek data user List", data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      <button
        className="bg-blue-800 text-white py-2 px-2 rounded hover:bg-blue-700 cursor-pointer mb-2"
        onClick={() => navigate("/user/add-user")}
      >
        Register User
      </button>
      <table className="table-auto w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.email}</td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.role}</td>
              <td className="border p-2">
                <a
                  href={"/user/edit-user/" + item.id}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
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
