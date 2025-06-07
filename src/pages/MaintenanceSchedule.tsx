// src/pages/MaintenanceSchedule.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Schedule {
  machineId: string;
  date: string;
  task: string;
}

export default function MaintenanceSchedule() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  useEffect(() => {
    axios.get("/api/maintenance/schedule").then((res) => setSchedule(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Jadwal Maintenance</h2>
      <div className="bg-white shadow rounded-md overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID Mesin</th>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Tugas</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{item.machineId}</td>
                <td className="p-2 border">{item.date}</td>
                <td className="p-2 border">{item.task}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
