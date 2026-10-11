"use client";
import { useRouter } from "next/navigation";
import { startDemo } from "@/lib/auth";
import { useData } from "@/lib/DataContext";

export default function DemoButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { loadDemo } = useData();

  function handleClick() {
    startDemo();
    loadDemo();
    router.push("/analyze");
  }

  return (
    <button onClick={handleClick} className={className}>
      Try live demo
    </button>
  );
}