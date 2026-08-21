const supabaseUrl = () => process.env.SUPABASE_URL || "";
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  if (!supabaseUrl() || !supabaseKey()) return Response.json({ ok: false }, { status: 503 });
  const body = await request.json().catch(() => null);
  const visitorId = typeof body?.visitor_id === "string" ? body.visitor_id.slice(0, 80) : "";
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId)) return Response.json({ ok: false }, { status: 400 });
  const response = await fetch(`${supabaseUrl()}/rest/v1/visitor_activity`, {
    method: "POST",
    headers: { apikey: supabaseKey(), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ visitor_id: visitorId, last_seen: new Date().toISOString() }),
  });
  return Response.json({ ok: response.ok }, { status: response.ok ? 200 : 500 });
}
