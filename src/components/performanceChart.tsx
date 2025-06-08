import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatChartData } from "../utils/formatChartData";
import type { PerformanceData } from "../pages/Dashboard";

interface Props {
  data: PerformanceData[];
}

const COLORS = [
  "#2563EB", // biru
  "#10B981", // hijau
  "#F59E0B", // kuning
  "#EF4444", // merah
  "#8B5CF6", // ungu
];

export function PerformanceChart({ data }: Props) {
  const { chartData, seriesKeys } = formatChartData(data);

  return (
    <div className="w-full h-80 bg-white shadow rounded-lg p-4 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis unit="%" />
          <Tooltip />
          <Legend />
          {seriesKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key.replace("|", " – ")} // tampilkan "Section – Unit"
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
