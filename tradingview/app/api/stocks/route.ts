export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FLASK = process.env.FLASK_API_URL || "http://127.0.0.1:5000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols");
  const url = symbols ? `${FLASK}/api/stocks?symbols=${symbols}` : `${FLASK}/api/stocks`;

  // retry up to 3 times for cold start
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return Response.json(data);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }

  return Response.json({ error: "Backend unavailable" }, { status: 503 });
}
