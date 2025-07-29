import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../libs/api";
import { PerformanceChart } from "../components/PerformanceChart";
import { MachineStatus } from "../types/machine";
import { useNavigate, Link } from "react-router-dom";

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

// New: fetch all months' section-unit performance
const getAllMonthsSectionUnitPerformance = () => {
  return useQuery<any>({
    queryKey: ["allMonthsSectionUnitPerformance"],
    queryFn: () => apiFetch("maintenance/allMonthsSectionUnitPerformance"),
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
  const navigate = useNavigate();

  const { data: performances, error, isLoading } = getChartData(timeframe);
  const { data: allMonthsSectionUnitPerformance, error: allMonthsError, isLoading: allMonthsLoading } = getAllMonthsSectionUnitPerformance();

  // Get current month in YYYY-MM
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthData = allMonthsSectionUnitPerformance?.data.find((m: any) => m.month === currentMonth)?.data || [];

  useEffect(() => {
    if (performances) {
      const formattedData = formatPerformanceData(performances);
      setData(formattedData);
    }
  }, [performances]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as any).message}</p>;

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label className="block text-sm font-medium mb-1 sm:mb-0">Pilihan jangka waktu grafik :</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
            className="w-full sm:w-auto border border-gray-300 rounded p-2 text-sm"
          >
            {Object.keys(TimeFrameOptions).map((t: string, index: number) => (
              <option key={index} value={t}>
                {TimeFrameOptions[t as TimeframeType]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <PerformanceChart data={data} />
          <div className="mt-1 p-1 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 font-semibold rounded text-xs sm:text-sm">
            Grafik performa dihitung menggunakan 22 hari kerja per bulan sebagai pembagi.
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 mb-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="h-full w-full mx-1 mb-2">
            <div className="block items-center justify-center h-full">
              <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  onClick={() => navigate("/machines")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm text-center"
                >
                  Machine List
                </button>
              </div>
              <span className="text-black font-bold">Machine Summary</span>
              <div className="overflow-x-auto">
                <table className="table-auto w-full border text-xs sm:text-sm">
                  <tbody>
                    <tr>
                      <th className="p-2 border text-left">Total</th>
                      <td className="p-2 border text-right font-semibold">
                        {performances?.length || 0}
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2 border text-left flex items-center">
                        <div className={`w-4 h-4 bg-green-500 rounded-full mr-1`} />{" "}
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
                          className={`w-4 h-4 bg-yellow-500 rounded-full mr-1`}
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
                        <div className={`w-4 h-4 bg-red-500 rounded-full mr-1`} />{" "}
                        <span>Out of Service</span>
                      </th>
                      <td className="p-2 border text-right font-semibold">
                        {performances?.filter(
                          (m) => m.machineStatus === MachineStatus.OUT_OF_SERVICE
                        ).length || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Section-Unit Performance Table for current month, with Month column */}
          <div className="h-full w-full mx-1 col-span-2">
            <div className="block items-center justify-center h-full">
              <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                <Link
                  to="/maintenance/section-unit-recap"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm text-center"
                >
                  Lihat Rekap Bulanan
                </Link>
              </div>
              <span className="text-black font-bold">Section / Unit Performance (Current Month)</span>
              {allMonthsLoading ? (
                <div className="p-2">Loading...</div>
              ) : allMonthsError ? (
                <div className="p-2 text-red-500">Error loading section-unit performance</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-auto w-full border text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Section</th>
                        <th className="p-2 border">Unit</th>
                        <th className="p-2 border">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMonthData.length === 0 ? (
                        <tr><td colSpan={4} className="p-2 text-center">No data</td></tr>
                      ) : (
                        currentMonthData.map((row: any, idx: number) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-2 border whitespace-nowrap">{currentMonth}</td>
                            <td className="p-2 border whitespace-nowrap">{row.section}</td>
                            <td className="p-2 border whitespace-nowrap">{row.unit}</td>
                            <td className="p-2 border text-center font-semibold">{row.performance}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-1 p-1 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 font-semibold rounded text-xs sm:text-sm">
                Performa dihitung menggunakan 22 hari kerja per bulan sebagai pembagi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
