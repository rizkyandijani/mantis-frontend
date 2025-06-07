import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";

interface PerformanceData {
  month: string;
  reportedDays: number;
  totalWorkingDays: number;
  section: string;
  machineName: string;
}

export interface machinePerformance {
  month: string;
  reportedDays: number;
  totalWorkingDays: number;
  section: string;
  machineName: string;
}

export interface monthlyPerformances {
  id: string;
  name: string;
  data: machinePerformance[];
}

export const getMachinePerformances = () => {
  return useQuery<monthlyPerformances[]>({
    queryKey: ["monthlyPerformances"],
    queryFn: () => apiFetch("/api/performances"),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default function Dashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);

  const { data: performances, error, isLoading } = getMachinePerformances();

  useEffect(() => {
    if (performances) {
      const formattedData: PerformanceData[] = performances.flatMap(
        (item: monthlyPerformances) =>
          item.data.map((performance: machinePerformance) => ({
            month: performance.month,
            reportedDays: performance.reportedDays,
            totalWorkingDays: performance.totalWorkingDays,
            section: item.name,
            machineName: performance.machineName,
          }))
      );
      setData(formattedData);
    }
  }, [performances]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

  console.log("cek performances", performances);
  console.log("cek loading", isLoading);
  console.log("cek error", error);

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-full">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center sm:text-left">
        Rekapan Performa Pemeliharaan Bulanan
      </h1>

      <div className="overflow-x-auto bg-white shadow rounded-md">
        <table className="table-auto w-full text-xs sm:text-sm md:text-base text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 sm:p-3 border">Bulan</th>
              <th className="p-2 sm:p-3 border">Section</th>
              <th className="p-2 sm:p-3 border">Nama Mesin</th>
              <th className="p-2 sm:p-3 border">Hari Dilaporkan</th>
              <th className="p-2 sm:p-3 border">Total Hari Kerja</th>
              <th className="p-2 sm:p-3 border">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {data.length &&
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.month}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.section}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.machineName}
                  </td>
                  <td className="p-2 sm:p-3 border text-center">
                    {row.reportedDays}
                  </td>
                  <td className="p-2 sm:p-3 border text-center">
                    {row.totalWorkingDays}
                  </td>
                  <td className="p-2 sm:p-3 border text-center font-semibold">
                    {((row.reportedDays / row.totalWorkingDays) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
