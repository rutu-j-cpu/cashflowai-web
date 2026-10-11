"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Model = { name: string; precision: number; recall: number; auc: number };

export default function ModelChart({ data }: { data: Model[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis domain={[0, 1]} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend />
          <Bar dataKey="precision" fill="#6366f1" radius={[6, 6, 0, 0]} />
          <Bar dataKey="recall" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          <Bar dataKey="auc" fill="#a78bfa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}