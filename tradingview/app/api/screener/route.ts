export const dynamic = "force-dynamic";

const FLASK = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const params = searchParams.toString();
  try {
    const res = await fetch(`${FLASK}/api/screener${params ? "?" + params : ""}`, { cache: "no-store" });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
