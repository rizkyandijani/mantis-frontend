import type { PerformanceData } from "../pages/Dashboard";

/**
 * Mengubah array PerformanceData menjadi:
 * [
 *   { date: "03 Jul 2025", "Bubut Dasar|WBS": 100.00 },
 *   { date: "04 Jul 2025", "Bubut Dasar|WBS": 95.00 },
 *   ...
 * ]
 * atau
 * [
 *   { date: "July 2025", "Bubut Dasar|WBS": 85.00 },
 *   ...
 * ]
 */
export function formatChartData(data: PerformanceData[]) {
  // 1) Kumpulkan semua kombinasi section|unit
  const seriesKeys = Array.from(
    new Set(data.map((d) => `${d.section}|${d.unit}`))
  );

  // 2) Gabungkan data berdasarkan tanggal/bulan
  const byDate: Record<string, any> = {};
  data.forEach((d) => {
    const label = d.dataLabel; // bisa daily ("03 Jul 2025") atau monthly ("July 2025")
    if (!byDate[label]) byDate[label] = { date: label };

    const key = `${d.section}|${d.unit}`;
    byDate[label][key] = parseFloat(d.percentage.replace("%", ""));
  });

  // 3) Urutkan berdasarkan tanggal (asumsi format konsisten dan urutan dari API sudah benar)
  const chartData = Object.values(byDate);

  console.log("cek chartdata", chartData, seriesKeys)
  return { chartData, seriesKeys };
}