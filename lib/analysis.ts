export type Row = Record<string, string>;

export function pickColumn(columns: string[], keywords: string[]) {
  for (const k of keywords) {
    const hit = columns.find((c) => c.toLowerCase().includes(k));
    if (hit) return hit;
  }
  return "";
}

export function parseAmount(v?: string) {
  const n = parseFloat((v ?? "").replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? NaN : n;
}

export function parseDate(v?: string) {
  if (!v || v.trim().length < 6) return null;
  const m = v.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  const d = m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function isIncome(v?: string) {
  return /income|credit|salary|deposit/i.test(v ?? "");
}

export function monthlyTotals(
  rows: Row[],
  dateCol: string,
  amountCol: string,
  include: (r: Row) => boolean
) {
  const totals: Record<string, number> = {};
  for (const r of rows) {
    if (!include(r)) continue;
    const d = parseDate(r[dateCol]);
    const a = parseAmount(r[amountCol]);
    if (!d || isNaN(a)) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    totals[key] = (totals[key] ?? 0) + Math.abs(a);
  }
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: Math.round(total) }));
}