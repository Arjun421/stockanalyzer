export const dynamic = "force-dynamic";

const FLASK = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

export async function GET(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "1mo";

  try {
    const res = await fetch(`${FLASK}/api/chart/${symbol}?period=${period}`, { cache: "no-store" });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
