import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../../libs/api";
import { FiDownload } from "react-icons/fi";

const getAllMonthsSectionUnitPerformance = () => {
  return useQuery<any>({
    queryKey: ["allMonthsSectionUnitPerformance"],
    queryFn: () => apiFetch("maintenance/allMonthsSectionUnitPerformance"),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
};

export default function SectionUnitPerformanceRecap() {
  const { data, error, isLoading } = getAllMonthsSectionUnitPerformance();
  const months = data?.data.map((m: any) => m.month) || [];
  const [selectedMonth, setSelectedMonth] = useState(months[0] || "");
  const monthData = data?.data.find((m: any) => m.month === selectedMonth)?.data || [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Rekap Performa Section / Unit Bulanan</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading data</div>
      ) : (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <label className="mr-2 font-medium">Pilih Bulan:</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {months.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (!monthData.length) return;
                const headers = ["Month", "Section", "Unit", "Performance"];
                const csvRows = monthData.map((row: any) => [selectedMonth, row.section, row.unit, row.performance + "%"]);
                const csvContent = [
                  headers.join(","),
                  ...csvRows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(","))
                ].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `section_unit_performance_${selectedMonth}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              disabled={!monthData.length}
            >
              <FiDownload /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto bg-white shadow rounded-md">
            <table className="table-auto w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Section</th>
                  <th className="p-2 border">Unit</th>
                  <th className="p-2 border">Performance</th>
                </tr>
              </thead>
              <tbody>
                {monthData.length === 0 ? (
                  <tr><td colSpan={4} className="p-2 text-center">No data</td></tr>
                ) : (
                  monthData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border whitespace-nowrap">{selectedMonth}</td>
                      <td className="p-2 border whitespace-nowrap">{row.section}</td>
                      <td className="p-2 border whitespace-nowrap">{row.unit}</td>
                      <td className="p-2 border text-center font-semibold">{row.performance}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 