export const dynamic = "force-dynamic";

const API_KEY = process.env.FINNHUB_API_KEY || "d7b0s9pr01qtpbha494gd7b0s9pr01qtpbha4950";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "general";
  const symbol = searchParams.get("symbol");

  try {
    let url = "";
    if (symbol) {
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`;
    } else {
      url = `https://finnhub.io/api/v1/news?category=${category}&token=${API_KEY}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return Response.json(Array.isArray(data) ? data.slice(0, 30) : []);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
