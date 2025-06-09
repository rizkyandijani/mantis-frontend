import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { PerformanceChart } from "../components/performanceChart";

export interface PerformanceData {
  month: string;
  reportedDays: number;
  totalWorkingDays: number;
  section: string;
  unit: string;
  percentage: string;
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
  month: string;
  year: string;
  machineType: string;
  section: string;
  unit: string;
  machineName: string;
  reportedDays: number;
  totalWorkingDays: number;
  percentage: string;
}

export const getMachinePerformances = () => {
  return useQuery<monthlyPerformances[]>({
    queryKey: ["totalMaintenancePerformance"],
    queryFn: () => apiFetch("maintenance/summary"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const formatPerformanceData = (performances: monthlyPerformances[]) => {
  return performances.map((performance) => ({
    month: `${performance.month} ${performance.year}`,
    reportedDays: performance.reportedDays,
    totalWorkingDays: performance.totalWorkingDays,
    section: performance.section,
    unit: performance.unit,
    machineName: performance.machineName,
    percentage: performance.percentage,
  })) as PerformanceData[];
};

export default function Dashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);

  const { data: performances, error, isLoading } = getMachinePerformances();

  useEffect(() => {
    if (performances) {
      const formattedData = formatPerformanceData(performances);
      setData(formattedData);
    }
  }, [performances]);

  console.log("cek performances", performances);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <PerformanceChart data={data} />
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center sm:text-left">
        Rekapan Performa Pemeliharaan Bulanan
      </h1>

      <div className="overflow-x-auto bg-white shadow rounded-md">
        <table className="table-auto w-full text-xs sm:text-sm md:text-base text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 sm:p-3 border">Bulan & Tahun</th>
              <th className="p-2 sm:p-3 border">Section</th>
              <th className="p-2 sm:p-3 border">Unit Kerja</th>
              <th className="p-2 sm:p-3 border">Nama Mesin</th>
              <th className="p-2 sm:p-3 border">Hari Dilaporkan</th>
              <th className="p-2 sm:p-3 border">Total Hari Kerja</th>
              <th className="p-2 sm:p-3 border">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.month}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.section}
                  </td>
                  <td className="p-2 sm:p-3 border whitespace-nowrap">
                    {row.unit}
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
                    {row.percentage}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
