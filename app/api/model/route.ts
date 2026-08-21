import { isAdmin } from "../../../lib/admin-auth";
import staticModel from "../../../public/model.json";

const FALLBACK = { ...staticModel, next_list_date: "2026-09-09T00:00:00+01:00", announcement: "" };
const supabaseUrl = () => process.env.SUPABASE_URL || "";
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseHeaders = (): Record<string, string> => {
  const value = supabaseKey();
  return value.startsWith("sb_secret_")
    ? { apikey: value }
    : { apikey: value, Authorization: `Bearer ${value}` };
};

export async function GET() {
  if (!supabaseUrl() || !supabaseKey()) return Response.json(FALLBACK, { headers: { "Cache-Control": "no-store" } });
  try {
    const response = await fetch(`${supabaseUrl()}/rest/v1/site_settings?key=eq.model&select=value`, {
      headers: supabaseHeaders(), cache: "no-store",
    });
    const rows = await response.json();
    return Response.json(rows?.[0]?.value || FALLBACK, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json(FALLBACK, { headers: { "Cache-Control": "no-store" } }); }
}

export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Unauthorized" }, { status: 403 });
  if (!supabaseUrl() || !supabaseKey()) return Response.json({ error: "Supabase non configuré" }, { status: 503 });
  const model = await request.json();
  if (!model || typeof model !== "object" || !model.schools) return Response.json({ error: "Invalid model" }, { status: 400 });
  const updatedAt = new Date().toISOString();
  const response = await fetch(`${supabaseUrl()}/rest/v1/site_settings`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ key: "model", value: model, updated_at: updatedAt }),
  });
  if (!response.ok) return Response.json({ error: await response.text() }, { status: 500 });
  return Response.json({ ok: true, updated_at: updatedAt });
}
