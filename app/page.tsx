import Link from "next/link";
import DemoButton from "@/components/DemoButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="flex flex-col items-center px-8 py-20 text-center">
        <span className="rounded-full border border-slate-700 px-4 py-1 text-sm text-slate-400">
          Detect · Explain · Trust
        </span>
        <h1 className="mt-6 text-5xl font-bold md:text-6xl">
          AI-Powered <span className="text-indigo-400">Financial Intelligence</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          One platform for people who want to understand their spending, and for
          fintech teams who need to catch fraud.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-8 pb-24 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-900 p-8">
          <p className="text-sm font-medium text-indigo-400">For individuals</p>
          <h2 className="mt-2 text-2xl font-bold">Understand your money</h2>
          <ul className="mt-4 space-y-2 text-slate-400">
            <li>• Spending breakdown by category</li>
            <li>• Monthly trends and patterns</li>
            <li>• Savings tips and unusual transaction flags</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <DemoButton className="rounded-full bg-indigo-500 px-6 py-2.5 font-medium hover:bg-indigo-400" />
            <Link href="/register" className="rounded-full border border-slate-600 px-6 py-2.5 font-medium hover:bg-slate-800">
              Create account
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-8">
          <p className="text-sm font-medium text-cyan-400">For fintech &amp; banks</p>
          <h2 className="mt-2 text-2xl font-bold">Catch fraud early</h2>
          <ul className="mt-4 space-y-2 text-slate-400">
            <li>• Random Forest trained on 500,000 transactions</li>
            <li>• 95% precision and 93% recall on 100,000 test transactions (PaySim, a synthetic dataset)</li>
            <li>• Feature importance shows what drives each alert</li>
          </ul>
          <div className="mt-6">
            <Link href="/dashboard" className="inline-block rounded-full bg-cyan-500 px-6 py-2.5 font-medium text-slate-950 hover:bg-cyan-400">
              View model performance
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}