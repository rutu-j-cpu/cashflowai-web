"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Row } from "@/lib/analysis";
import { generateDemoData } from "@/lib/demoData";
import { getSession } from "@/lib/auth";

type DataState = {
  rows: Row[];
  columns: string[];
  fileName: string;
  setData: (rows: Row[], columns: string[], fileName: string) => void;
  loadDemo: () => void;
};

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  function setData(r: Row[], c: string[], f: string) {
    setRows(r);
    setColumns(c);
    setFileName(f);
  }

  function loadDemo() {
    const demo = generateDemoData();
    setData(demo.rows, demo.columns, "Sample transactions (demo data)");
  }

  useEffect(() => {
    if (getSession()?.email === "demo@cashflowai.app") loadDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataContext.Provider value={{ rows, columns, fileName, setData, loadDemo }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}