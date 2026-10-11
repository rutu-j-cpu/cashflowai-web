"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered") === "1");
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await loginUser(email, password);
    if (!res.ok) return setError(res.error);
    router.push("/analyze");
  }

  const input =
    "mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 outline-none focus:border-indigo-500";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 p-8 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-slate-900 p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Log in to analyse your transactions</p>
        {registered && (
          <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            Account created. Please log in.
          </p>
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button className="mt-6 w-full rounded-lg bg-indigo-500 py-2.5 font-medium hover:bg-indigo-400">
          Log in
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          New here? <Link href="/register" className="text-indigo-400 hover:underline">Create an account</Link>
        </p>
      </form>
    </main>
  );
}