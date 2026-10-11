import results from "@/data/results.json";
import ModelChart from "@/components/ModelChart";
import FeatureChart from "@/components/FeatureChart";

export default function Dashboard() {
  const best = [...results.models].sort((a, b) => b.auc - a.auc)[0];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">Fraud Detection</h1>
      <p className="mt-2 text-slate-400">Model comparison on 100,000 test transactions</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Best model (by AUC)</p>
          <p className="mt-1 text-2xl font-semibold">{best.name}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Precision</p>
          <p className="mt-1 text-2xl font-semibold">{best.precision}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Recall</p>
          <p className="mt-1 text-2xl font-semibold">{best.recall}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Precision, recall and AUC</h2>
        <ModelChart data={results.models} />
      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Top features (Random Forest)</h2>
        <FeatureChart data={results.features} />
      </div>
    </main>
  );
}