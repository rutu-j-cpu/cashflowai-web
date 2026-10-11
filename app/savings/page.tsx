"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSession } from "@/lib/auth";
import { useData } from "@/lib/DataContext";
import { type Row, pickColumn, parseAmount, isIncome, monthlyTotals } from "@/lib/analysis";

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function Savings() {
  const router = useRouter();
  const { rows, columns, fileName } = useData();

  useEffect(() => {
    if (!getSession()) router.push("/login");
  }, [router]);

  const s = useMemo(() => {
    if (!rows.length) return null;
    const amountCol = pickColumn(columns, ["amount", "amt", "value", "debit"]) || columns[0];
    const typeCol = pickColumn(columns, ["type"]);
    const dateCol = pickColumn(columns, ["date", "time"]);
    const hasIncome = !!typeCol && rows.some((r) => isIncome(r[typeCol]));
    const catCol =
      pickColumn(columns, ["category", "merchant", "description"]) || (hasIncome ? "" : typeCol);
    const isExpense = (r: Row) => !(hasIncome && isIncome(r[typeCol]));

    let totalExpense = 0;
    let totalIncome = 0;
    let biggest = { amount: 0, label: "" };
    const byCat: Record<string, number> = {};

    for (const r of rows) {
      const a = parseAmount(r[amountCol]);
      if (isNaN(a)) continue;
      const v = Math.abs(a);
      if (!isExpense(r)) {
        totalIncome += v;
        continue;
      }
      totalExpense += v;
      const label = (catCol && r[catCol]) || "Other";
      byCat[label] = (byCat[label] ?? 0) + v;
      if (v > biggest.amount) biggest = { amount: v, label };
    }

    const categories = Object.entries(byCat)
      .map(([name, total]) => ({
        name,
        total: Math.round(total),
        share: totalExpense ? (total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const months = dateCol ? monthlyTotals(rows, dateCol, amountCol, isExpense) : [];
    const avgMonthly = months.length ? months.reduce((sum, m) => sum + m.total, 0) / months.length : null;
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    const change = last && prev && prev.total > 0 ? ((last.total - prev.total) / prev.total) * 100 : null;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : null;

    const tips: string[] = [];
    const top = categories[0];
    if (catCol && top && top.share >= 25) {
      tips.push(`${top.name} is ${top.share.toFixed(0)}% of your spending. Cutting it by 10% would save about ${fmt(top.total * 0.1)}.`);
    }
    if (catCol && categories.length >= 3) {
      const top3 = categories.slice(0, 3).reduce((sum, c) => sum + c.share, 0);
      if (top3 >= 60) tips.push(`Your top 3 categories make up ${top3.toFixed(0)}% of spending, so that is where savings are easiest to find.`);
    }
    if (change !== null && change > 15) tips.push(`Spending rose ${change.toFixed(0)}% in the latest month compared to the one before. Check what changed.`);
    if (change !== null && change < -15) tips.push(`Spending fell ${Math.abs(change).toFixed(0)}% in the latest month. Good progress.`);
    if (savingsRate !== null && savingsRate < 20) tips.push(`Your savings rate is ${savingsRate.toFixed(0)}%. A common target is 20% or more.`);
    if (savingsRate !== null && savingsRate >= 20) tips.push(`Your savings rate is ${savingsRate.toFixed(0)}%, which is healthy.`);
    if (!catCol) tips.push("No category column was found, so category tips are unavailable. Upload a file with a Category column for more insights.");
    if (!tips.length) tips.push("No single category dominates your spending and there are no big swings. Nothing urgent to fix.");

    return { categories, avgMonthly, biggest, savingsRate, totalExpense, tips };
  }, [rows, columns]);

  if (!s) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-bold">Savings Insights</h1>
        <p className="mt-4 text-slate-400">
          No data yet. <Link href="/analyze" className="text-indigo-400 hover:underline">Upload a CSV on the Analyze page</Link> first,
          then come back here using the navbar (refreshing the page clears the file).
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Savings Insights</h1>
      <p className="mt-2 text-slate-400">Based on {fileName}. These tips come from simple rules on your data.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Total spending</p><p className="mt-1 text-2xl font-semibold">{fmt(s.totalExpense)}</p></div>
        <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Average per month</p><p className="mt-1 text-2xl font-semibold">{s.avgMonthly !== null ? fmt(s.avgMonthly) : "No date column"}</p></div>
        <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Biggest expense</p><p className="mt-1 text-2xl font-semibold">{fmt(s.biggest.amount)}</p><p className="mt-1 truncate text-xs text-slate-500">{s.biggest.label}</p></div>
        <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Savings rate</p><p className="mt-1 text-2xl font-semibold">{s.savingsRate !== null ? `${s.savingsRate.toFixed(0)}%` : "No income data"}</p></div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Where your money goes</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.categories} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={150} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="total" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Recommendations</h2>
        <ul className="space-y-3">
          {s.tips.map((t, i) => (
            <li key={i} className="rounded-xl bg-slate-950 p-4 text-slate-300">💡 {t}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}