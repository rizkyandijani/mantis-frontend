import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { PerformanceChart } from "../components/PerformanceChart";
import { MachineStatus } from "../types/machine";
import { useNavigate } from "react-router-dom";

export interface PerformanceData {
  dataLabel: string;
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
  dataLabel: string;
  machineType: string;
  section: string;
  unit: string;
  machineName: string;
  reportedDays: number;
  totalWorkingDays: number;
  percentage: string;
  machineStatus: MachineStatus;
}

enum TimeframeType {
  LAST_YEAR = "LAST_YEAR",
  CURRENT_YEAR = "CURRENT_YEAR",
  LAST_90_DAYS = "LAST_90_DAYS",
  LAST_MONTH = "LAST_MONTH",
  CURRENT_MONTH = "CURRENT_MONTH",
}

const generateDateRange = (timeframe: TimeframeType) => {
  const today = new Date();
  let from: string;
  let to: string;

  switch (timeframe) {
    case TimeframeType.LAST_YEAR:
      from = new Date(today.getFullYear() - 1, 0, 1).toISOString();
      to = new Date(today.getFullYear() - 1, 11, 31).toISOString();
      break;
    case TimeframeType.CURRENT_YEAR:
      from = new Date(today.getFullYear(), 0, 1).toISOString();
      to = new Date(today.getFullYear(), 11, 31).toISOString();
      break;
    case TimeframeType.LAST_90_DAYS:
      from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      to = today.toISOString();
      break;
    case TimeframeType.LAST_MONTH:
      from = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      ).toISOString();
      to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString();
      break;
    case TimeframeType.CURRENT_MONTH:
      from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      to = today.toISOString();
      break;
    default:
      from = today.toISOString();
      to = today.toISOString();
  }

  return { from, to };
};

const TimeFrameOptions: Record<TimeframeType, string> = {
  [TimeframeType.LAST_YEAR]: "Tahun Lalu",
  [TimeframeType.CURRENT_YEAR]: "Tahun Ini",
  [TimeframeType.LAST_90_DAYS]: "90 Hari Terakhir",
  [TimeframeType.LAST_MONTH]: "Bulan Lalu",
  [TimeframeType.CURRENT_MONTH]: "Bulan Ini",
};

export const getChartData = (timeframe: TimeframeType) => {
  return useQuery<monthlyPerformances[]>({
    queryKey: ["totalMaintenancePerformance", timeframe],
    queryFn: () =>
      apiFetch(
        `maintenance/summary?${new URLSearchParams(
          generateDateRange(timeframe ?? TimeframeType.CURRENT_YEAR)
        )}`
      ),
    enabled: !!timeframe,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const getUnitsPerformance = () => {
  return useQuery<any>({
    queryKey: ["totalUnitPerformances"],
    queryFn: () => apiFetch("maintenance/unitSums"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const getSectionsPerformance = () => {
  return useQuery<any>({
    queryKey: ["totalSectionPerformances"],
    queryFn: () => apiFetch("maintenance/sectionSums"),

    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const formatPerformanceData = (performances: any[]) => {
  return performances.map((performance) => {
    const date = performance.dataLabel
      ? performance.dataLabel
      : `${performance.month} ${performance.year}`;

    return {
      dataLabel: date,
      reportedDays: performance.reportedDays,
      totalWorkingDays: performance.totalWorkingDays,
      section: performance.section,
      unit: performance.unit,
      machineName: performance.machineName,
      percentage: performance.percentage,
      machineStatus: performance.machineStatus,
    };
  });
};

export default function Dashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeType>(
    TimeframeType.CURRENT_YEAR
  );
  console.log("cek timeframe", timeframe);
  const navigate = useNavigate();

  const { data: performances, error, isLoading } = getChartData(timeframe);
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
      <div>
        <div>
          <label>{"Pilihan jangka waktu grafik : "}</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
            className="w-1/8 border border-gray-300 rounded p-2 mb-4"
          >
            {Object.keys(TimeFrameOptions).map((t: string, index: number) => (
              <option key={index} value={t}>
                {TimeFrameOptions[t as TimeframeType]}
              </option>
            ))}
          </select>
        </div>
        {data.length ? (
          <PerformanceChart data={data} />
        ) : (
          <div className="w-full h-xs mb-3">
            <span>No data for Chart</span>
          </div>
        )}
      </div>
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
                    {row.dataLabel}
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
