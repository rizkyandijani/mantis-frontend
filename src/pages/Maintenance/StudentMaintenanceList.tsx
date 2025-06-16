// src/pages/StudentMaintenancePage.tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../libs/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  DailyMaintenanceData,
  MAINTENANCE_STATUS_COLORS,
  MAINTENANCE_STATUS_WORDS,
} from "../../types/maintenance";
import { useEffect, useState } from "react";

export default function StudentMaintenancePage() {
  const { userId } = useAuth();
  const [myMaintenances, setMyMaintenances] = useState<DailyMaintenanceData[]>(
    []
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["studentDailyMaintenance", userId],
    queryFn: () => apiFetch(`maintenance/listing/by-student`),
    enabled: !!userId, // only run when userId is available
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) {
      setMyMaintenances(data as DailyMaintenanceData[]);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Riwayat Perawatan Harian Saya</h2>
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="table-auto w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Mesin</th>
              <th className="p-2 border">Section</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {myMaintenances.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="p-2 border">{item.machine.name}</td>
                <td className="p-2 border">{item.machine.section}</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border">
                  {item.status ? (
                    <span
                      className={`${
                        MAINTENANCE_STATUS_COLORS[item.status] ||
                        "text-gray-600"
                      } font-semibold`}
                    >
                      {MAINTENANCE_STATUS_WORDS[item.status]}
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Menunggu
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
