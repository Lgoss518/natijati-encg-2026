import { isAdmin } from "../../../lib/admin-auth";

const supabaseUrl = () => process.env.SUPABASE_URL || "";
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "Unauthorized" }, { status: 403 });
  const response = await fetch(`${supabaseUrl()}/rest/v1/visitor_activity?select=visitor_id,first_seen,last_seen`, {
    headers: { apikey: supabaseKey() }, cache: "no-store",
  });
  if (!response.ok) return Response.json({ error: "Stats unavailable" }, { status: 500 });
  const rows = await response.json() as Array<{first_seen:string;last_seen:string}>;
  const now = Date.now(); const today = new Date(); today.setHours(0,0,0,0);
  return Response.json({
    total: rows.length,
    online: rows.filter(row => now - new Date(row.last_seen).getTime() < 120000).length,
    today: rows.filter(row => new Date(row.first_seen).getTime() >= today.getTime()).length,
  }, { headers: { "Cache-Control": "no-store" } });
}
