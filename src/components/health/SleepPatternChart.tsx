import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sleepData = [
  { day: "Monday", deep: 5, light: 9 },
  { day: "Tuesday", deep: 4, light: 8 },
  { day: "Wednesday", deep: 6, light: 7 },
  { day: "Thursday", deep: 3, light: 10 },
  { day: "Friday", deep: 5, light: 6 },
  { day: "Saturday", deep: 5, light: 10 },
  { day: "Sunday", deep: 4, light: 11 },
];

export default function SleepPatternChart() {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Sleep Pattern</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-meow-orange" />
            <span className="text-[10px] text-gray-500">Deep</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-meow-gold" />
            <span className="text-[10px] text-gray-500">Light</span>
          </div>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sleepData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#666" }} stroke="#eee" />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="deep" stackId="sleep" fill="#FF8200" radius={[0, 0, 0, 0]} barSize={36} />
            <Bar dataKey="light" stackId="sleep" fill="#FFC929" radius={[6, 6, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-3 text-center">
        <div>
          <p className="text-xl font-bold text-meow-dark">14.5h</p>
          <p className="text-[10px] text-gray-400">Total</p>
        </div>
        <div>
          <p className="text-xl font-bold text-meow-dark">4.5h</p>
          <p className="text-[10px] text-gray-400">Deep</p>
        </div>
        <div>
          <p className="text-xl font-bold text-meow-dark">10h</p>
          <p className="text-[10px] text-gray-400">Light</p>
        </div>
      </div>
    </div>
  );
}
