
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSession } from "@/lib/auth";
import { useData } from "@/lib/DataContext";
import { type Row, pickColumn, parseAmount, monthlyTotals } from "@/lib/analysis";

const tip = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8 };

export default function Analyze() {
  const router = useRouter();
  const { rows, columns, fileName, setData } = useData();
  const [amountSel, setAmountSel] = useState("");
  const [groupSel, setGroupSel] = useState<string | null>(null);
  const [dateSel, setDateSel] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  useEffect(() => {
    if (!getSession()) router.push("/login");
  }, [router]);

  const defaults = useMemo(
    () => ({
      amount: pickColumn(columns, ["amount", "amt", "value", "debit"]) || columns[0] || "",
      group: pickColumn(columns, ["category", "type", "merchant", "description"]),
      date: pickColumn(columns, ["date", "time"]),
    }),
    [columns]
  );
  const amountCol = amountSel || defaults.amount;
  const groupCol = groupSel ?? defaults.group;
  const dateCol = dateSel ?? defaults.date;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setAmountSel("");
        setGroupSel(null);
        setDateSel(null);
        setData(res.data, res.meta.fields ?? [], file.name);
      },
    });
  }

  const analysis = useMemo(() => {
    if (!rows.length || !amountCol) return null;
    const amounts = rows.map((r) => parseAmount(r[amountCol]));
    const valid = amounts.filter((a) => !isNaN(a));
    if (!valid.length) return null;

    const total = valid.reduce((s, a) => s + a, 0);
    const avg = total / valid.length;
    const variance = valid.reduce((s, a) => s + (a - avg) ** 2, 0) / valid.length;
    const limit = avg + 3 * Math.sqrt(variance);

    const groups: Record<string, number> = {};
    rows.forEach((r, i) => {
      if (isNaN(amounts[i])) return;
      const key = groupCol ? r[groupCol] || "Unknown" : "All";
      groups[key] = (groups[key] ?? 0) + amounts[i];
    });
    const chart = Object.entries(groups)
      .map(([name, sum]) => ({ name, total: Math.round(sum) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const flagged = valid.filter((a) => a > limit).length;
    return { amounts, count: valid.length, total, avg, limit, flagged, chart };
  }, [rows, amountCol, groupCol]);

  const monthly = useMemo(
    () => (dateCol && amountCol ? monthlyTotals(rows, dateCol, amountCol, () => true) : []),
    [rows, dateCol, amountCol]
  );

  const tableRows = useMemo(() => {
    if (!analysis) return [];
    const q = search.toLowerCase();
    return rows
      .map((r, i) => ({ r, flagged: analysis.amounts[i] > analysis.limit }))
      .filter((x) => !onlyFlagged || x.flagged)
      .filter((x) => !q || Object.values(x.r).some((v) => String(v).toLowerCase().includes(q)))
      .slice(0, 100);
  }, [rows, analysis, search, onlyFlagged]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const shownCols = columns.slice(0, 8);
  const select = "ml-2 rounded-lg bg-slate-800 px-3 py-1.5 text-white";

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Analyze Transactions</h1>
      <p className="mt-2 text-slate-400">Upload a CSV. It is processed in your browser and never leaves your computer.</p>

      <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 p-10 hover:border-indigo-500">
        <span className="text-lg font-medium">{fileName || "Click to choose a CSV file"}</span>
        <span className="mt-1 text-sm text-slate-500">Works best with files under 50,000 rows</span>
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </label>

      {analysis && (
        <>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <label className="text-slate-400">
              Amount column
              <select value={amountCol} onChange={(e) => setAmountSel(e.target.value)} className={select}>
                {columns.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-slate-400">
              Group by
              <select value={groupCol} onChange={(e) => setGroupSel(e.target.value)} className={select}>
                <option value="">(none)</option>
                {columns.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-slate-400">
              Date column
              <select value={dateCol} onChange={(e) => setDateSel(e.target.value)} className={select}>
                <option value="">(none)</option>
                {columns.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Transactions</p><p className="mt-1 text-2xl font-semibold">{fmt(analysis.count)}</p></div>
            <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Total amount</p><p className="mt-1 text-2xl font-semibold">{fmt(analysis.total)}</p></div>
            <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Average</p><p className="mt-1 text-2xl font-semibold">{fmt(analysis.avg)}</p></div>
            <div className="rounded-2xl bg-slate-900 p-5"><p className="text-sm text-slate-400">Unusually large</p><p className="mt-1 text-2xl font-semibold text-amber-400">{fmt(analysis.flagged)}</p></div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Total amount by {groupCol || "all"}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.chart}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={tip} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {monthly.length > 1 && (
            <div className="mt-6 rounded-2xl bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Monthly trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={tip} />
                    <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-slate-900 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h2 className="text-xl font-semibold">Transactions</h2>
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
                Only flagged
              </label>
              <span className="text-xs text-slate-500">Showing up to 100 rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    {shownCols.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}
                    <th className="px-3 py-2">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((x, i) => (
                    <tr key={i} className="border-t border-slate-800">
                      {shownCols.map((c) => <td key={c} className="px-3 py-2">{x.r[c]}</td>)}
                      <td className="px-3 py-2">
                        {x.flagged && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Unusually large</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}