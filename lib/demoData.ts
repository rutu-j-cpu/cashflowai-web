import type { Row } from "@/lib/analysis";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const spending = [
  { category: "Rent", items: ["Monthly rent"], min: 9500, max: 9500, perMonth: 1 },
  { category: "Food & Dining", items: ["Swiggy order", "Zomato order", "Cafe visit", "Restaurant dinner"], min: 150, max: 900, perMonth: 14 },
  { category: "Groceries", items: ["BigBasket", "D-Mart", "Local market"], min: 300, max: 2200, perMonth: 6 },
  { category: "Transport", items: ["Uber ride", "Metro recharge", "Fuel"], min: 80, max: 1200, perMonth: 10 },
  { category: "Shopping", items: ["Amazon order", "Myntra order", "Electronics store"], min: 400, max: 6000, perMonth: 4 },
  { category: "Entertainment", items: ["Netflix", "Movie tickets", "Spotify", "Gaming"], min: 150, max: 1500, perMonth: 4 },
  { category: "Utilities", items: ["Electricity bill", "Internet bill", "Mobile recharge"], min: 300, max: 2500, perMonth: 3 },
  { category: "Health", items: ["Pharmacy", "Doctor visit", "Gym membership"], min: 200, max: 3000, perMonth: 2 },
];

export function generateDemoData() {
  const rand = seeded(42);
  const rows: Row[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");

  for (let month = 4; month <= 9; month++) {
    rows.push({ Date: `2026-${pad(month)}-01`, Category: "Salary", Description: "Monthly salary", Type: "Income", Amount: "80000" });
    if (month === 6) {
      rows.push({ Date: "2026-06-18", Category: "Freelance", Description: "Freelance project", Type: "Income", Amount: "8000" });
    }
    for (const c of spending) {
      for (let i = 0; i < c.perMonth; i++) {
        const day = 1 + Math.floor(rand() * 27);
        const item = c.items[Math.floor(rand() * c.items.length)];
        const amount = Math.round(c.min + rand() * (c.max - c.min));
        rows.push({ Date: `2026-${pad(month)}-${pad(day)}`, Category: c.category, Description: item, Type: "Expense", Amount: String(amount) });
      }
    }
  }

  rows.push({ Date: "2026-08-22", Category: "Shopping", Description: "Laptop purchase", Type: "Expense", Amount: "48000" });
  rows.sort((a, b) => a.Date.localeCompare(b.Date));

  return { rows, columns: ["Date", "Category", "Description", "Type", "Amount"] };
}