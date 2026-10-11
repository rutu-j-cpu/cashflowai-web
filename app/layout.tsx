import "./globals.css";
import Navbar from "@/components/Navbar";
import { DataProvider } from "@/lib/DataContext";

export const metadata = {
  title: "CashFlowAI",
  description: "Smart expense analytics and fraud detection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950">
        <DataProvider>
          <Navbar />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}