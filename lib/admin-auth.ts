import { cookies } from "next/headers";

export const ADMIN_COOKIE = "natijati_admin";

async function digest(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}

export async function expectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.AUTH_SECRET || "";
  return password && secret ? digest(`${password}:${secret}`) : "";
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const expected = await expectedAdminToken();
  return Boolean(expected && token === expected);
}
