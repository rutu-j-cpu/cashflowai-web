"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, logout, type Session } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<Session | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getSession());
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-8 py-4 text-white">
      <Link href="/" className="text-lg font-bold">
        CashFlow<span className="text-indigo-400">AI</span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-slate-300">
        <Link href="/" className="hover:text-white">Home</Link>
        {user && (
          <>
            <Link href="/analyze" className="hover:text-white">Analyze CSV</Link>
            <Link href="/savings" className="hover:text-white">Savings Insights</Link>
            <Link href="/dashboard" className="hover:text-white">Fraud Dashboard</Link>
            <span className="text-slate-500">Hi, {user.name.split(" ")[0]}</span>
            <button onClick={handleLogout} className="rounded-full border border-slate-600 px-4 py-1.5 hover:bg-slate-800">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/register" className="rounded-full bg-indigo-500 px-4 py-1.5 text-white hover:bg-indigo-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}