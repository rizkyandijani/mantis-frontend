import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { PerformanceChart } from "../components/PerformanceChart";
import { MachineStatus } from "../types/machine";
import { useNavigate } from "react-router-dom";

export interface PerformanceData {
  month: string;
  reportedDays: number;
  totalWorkingDays: number;
  section: string;
  unit: string;
  percentage: string;
  machineName: string;
  machineStatus: MachineStatus;
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
  machineStatus: MachineStatus;
}

export const getMachinePerformances = () => {
  return useQuery<monthlyPerformances[]>({
    queryKey: ["totalMaintenancePerformance"],
    queryFn: () => apiFetch("maintenance/summary"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const getUnitsPerformance = () => {
  return useQuery<any>({
    queryKey: ["totalUnitPerformances"],
    queryFn: () => apiFetch("maintenance/summary/units"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const getSectionsPerformance = () => {
  return useQuery<any>({
    queryKey: ["totalSectionPerformances"],
    queryFn: () => apiFetch("maintenance/summary/sections"),

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
    machineStatus: performance.machineStatus,
  })) as PerformanceData[];
};

export default function Dashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const navigate = useNavigate();

  const { data: performances, error, isLoading } = getMachinePerformances();
  const {
    data: unitPerformance,
    error: unitError,
    isLoading: unitIsLoading,
  } = getUnitsPerformance();
  const {
    data: sectionPerformance,
    error: sectionError,
    isLoading: sectionIsLoading,
  } = getSectionsPerformance();

  console.log("cek unit performance", unitPerformance);
  console.log("cek section performance", sectionPerformance);

  console.log("cek performances");
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
      <div className="grid gap-4 grid-cols-1 mb-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="h-full w-full mx-1 mb-2">
          <div className="block items-center justify-center h-full">
            <span className="text-black font-bold">Machine Summary</span>
            <table className="table-auto w-full border">
              <tbody>
                <tr>
                  <th className="p-2 border text-left">Total</th>
                  <td className="p-2 border text-right font-semibold">
                    {performances?.length || 0}
                  </td>
                </tr>
                <tr>
                  <th className="p-2 border text-left flex items-center">
                    <div className={`w-5 h-5 bg-green-500 rounded-full mr-1`} />{" "}
                    <span>Active</span>
                  </th>
                  <td className="p-2 border text-right font-semibold">
                    {performances?.filter(
                      (m) => m.machineStatus === MachineStatus.OPERATIONAL
                    ).length || 0}
                  </td>
                </tr>
                <tr>
                  <th className="p-2 border text-left flex items-center">
                    <div
                      className={`w-5 h-5 bg-yellow-500 rounded-full mr-1`}
                    />{" "}
                    <span>Maintenance</span>
                  </th>
                  <td className="p-2 border text-right font-semibold">
                    {performances?.filter(
                      (m) => m.machineStatus === MachineStatus.MAINTENANCE
                    ).length || 0}
                  </td>
                </tr>
                <tr>
                  <th className="p-2 border text-left flex items-center">
                    <div className={`w-5 h-5 bg-red-500 rounded-full mr-1`} />{" "}
                    <span>Maintenance</span>
                  </th>
                  <td className="p-2 border text-right font-semibold">
                    {performances?.filter(
                      (m) => m.machineStatus === MachineStatus.OUT_OF_SERVICE
                    ).length || 0}
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => navigate("/machines")}
              className="text-white mt-1 px-1 py-1 bg-blue-700 cursor-pointer hover:bg-blue-500"
            >
              Machine List
            </button>
          </div>
        </div>
        <div className="h-full w-full mx-1">
          <div className="block items-center justify-center h-full">
            <span className="text-black font-bold">Unit Summary</span>
            <table>
              <thead>
                <tr>
                  <td className="p-2 border">Name</td>
                  <td className="p-2 border">Performance</td>
                </tr>
              </thead>
              <tbody>
                {unitPerformance?.data.map((unit: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border whitespace-nowrap">
                      {unit.unit}
                    </td>
                    <td className="p-2 border text-center font-semibold">
                      {unit.performance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="h-full w-full mx-1">
          <div className="block items-center justify-center h-full">
            <span className="text-black font-bold">Section Summary</span>
            <table>
              <thead>
                <tr>
                  <td className="p-2 border">Section Name</td>
                  <td className="p-2 border">Performance</td>
                </tr>
              </thead>
              <tbody>
                {sectionPerformance?.data.map((section: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border whitespace-nowrap">
                      {section.section}
                    </td>
                    <td className="p-2 border text-center font-semibold">
                      {section.performance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
