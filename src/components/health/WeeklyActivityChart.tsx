import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyData = [
    {day: "Monday", activity: 65},
    {day: "Tuesday", activity: 72},
    {day: "Wednesday", activity: 58},
    {day: "Tuesday", activity: 80},
    {day: "Friday", activity: 45},
    {day: "Saturday", activity: 90},
    {day: "Sunday", activity: 70},
];

export default function WeeklyActivityChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize: 12}} stroke="#999"/>
                <YAxis domain={[0, 100]} tick={{fontSize: 10}} stroke="#999"/>
                <Tooltip />
                <Bar
                dataKey="activity"
                fill="#ffc929"
                radius={[6, 6, 0, 0]}
                barSize={32}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}