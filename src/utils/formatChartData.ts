import type { PerformanceData } from "../pages/Dashboard";

/**
 * Mengubah array PerformanceData jadi:
 * [
 *   { month: "April 2025", "Bubut Dasar|WBS": 136.36, "Frais Dasar|WBS": 136.36 },
 *   { month: "May 2025",   "Bubut Dasar|WBS": 136.36, "Frais Dasar|WBS": 136.36 },
 *   ...
 * ]
 */
export function formatChartData(data: PerformanceData[]) {
  // 1) Kumpulkan semua kombinasi section|unit
  const seriesKeys = Array.from(
    new Set(data.map((d) => `${d.section}|${d.unit}`))
  );

  // 2) Bangun array dengan satu objek per bulan
  const byMonth: Record<string, any> = {};
  data.forEach((d) => {
    if (!byMonth[d.month]) byMonth[d.month] = { month: d.month };
    // simpan persentase sebagai angka (buang "%")
    byMonth[d.month][`${d.section}|${d.unit}`] = parseFloat(
      d.percentage.replace("%", "")
    );
  });

  // 3) Urutkan bulan sesuai kemunculan
  const chartData = Object.values(byMonth);

  return { chartData, seriesKeys };
}
