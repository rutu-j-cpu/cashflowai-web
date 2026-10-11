const USERS_KEY = "cashflow_users";
const SESSION_KEY = "cashflow_session";

type Users = Record<string, { name: string; hash: string }>;
export type Session = { email: string; name: string };

async function hash(text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): Users {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function registerUser(name: string, email: string, password: string) {
  const users = loadUsers();
  const key = email.trim().toLowerCase();
  if (users[key]) {
    return { ok: false, error: "An account with this email already exists. Please log in." };
  }
  users[key] = { name: name.trim(), hash: await hash(password) };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, error: "" };
}

export async function loginUser(email: string, password: string) {
  const users = loadUsers();
  const key = email.trim().toLowerCase();
  const user = users[key];
  if (!user || user.hash !== (await hash(password))) {
    return { ok: false, error: "Wrong email or password." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: key, name: user.name }));
  return { ok: true, error: "" };
}

export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function startDemo() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: "demo@cashflowai.app", name: "Demo" })
  );
}