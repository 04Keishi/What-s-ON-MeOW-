import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HealthMetric } from "@/types";
import { formatTimestamp } from "@/data/helpers";

interface HeartRateChartProps {
    data: HealthMetric[];
}

export default function HeartRateChart({data}: HeartRateChartProps) {
    const chartData = data.slice(-10).map((m) => ({
        time: formatTimestamp(m.timestamp),
        heartRate: m.heartRate,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#999" />
                <YAxis domain={[60, 220]} tick={{fontSize: 10}} stroke="#999" />
                <Tooltip />
                <Line 
                type="monotone"
                dataKey="heartRate"
                stroke="#FF8200"
                strokeWidth={2}
                dot= {{fill: "#ff8200", r: 3}}
                activeDot={{r:5}}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}