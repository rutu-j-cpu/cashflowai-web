"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    if (!email.includes("@")) return setError("Enter a valid email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const res = await registerUser(name, email, password);
    if (!res.ok) return setError(res.error);
    router.push("/login?registered=1");
  }

  const input =
    "mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 outline-none focus:border-indigo-500";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 p-8 text-white">
      <form onSubmit={handleRegister} className="w-full max-w-sm rounded-2xl bg-slate-900 p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Start analysing your transactions</p>
        <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button className="mt-6 w-full rounded-lg bg-indigo-500 py-2.5 font-medium hover:bg-indigo-400">
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already registered? <Link href="/login" className="text-indigo-400 hover:underline">Log in</Link>
        </p>
      </form>
    </main>
  );
}