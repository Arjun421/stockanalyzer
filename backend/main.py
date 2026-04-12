from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from services.stockService import get_stock_data, get_multiple_stocks
from services.newsService import get_news
from agents import technicalAgent, newsAgent, riskAgent, masterAgent, explainAgent
from typing import Optional

app = FastAPI(title="Stock AI Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AI Analysis ──────────────────────────────────────────────
@app.get("/analyze/{symbol}")
def analyze(symbol: str):
    stock = get_stock_data(symbol.upper())
    if not stock:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    news = get_news(symbol)
    technical = technicalAgent.analyze(stock)
    news_result = newsAgent.analyze(news)
    risk = riskAgent.analyze(stock)
    master = masterAgent.analyze(technical, news_result, risk)
    explanation = explainAgent.explain(stock, master, technical, news_result, risk)
    return {
        "stock": stock["symbol"], "name": stock["name"],
        "price": stock["close"], "change_pct": stock["change_pct"],
        "decision": master["decision"], "confidence": master["confidence"],
        "confidence_level": master["confidence_level"],
        "confidence_reason": master["confidence_reason"],
        "market_condition": master["market_condition"],
        "entry_signal": master["entry_signal"],
        "time_horizon": master["time_horizon"],
        "reason": master["reasons"], "risk": risk["risk"],
        "explanation": explanation, "scores": master["scores"]
    }

# ── Stock Data (replaces Flask) ───────────────────────────────
@app.get("/api/stocks")
def get_stocks(symbols: Optional[str] = Query(None)):
    tickers = [s.strip().upper() for s in symbols.split(",")] if symbols else None
    return get_multiple_stocks(tickers)

@app.get("/api/chart/{symbol}")
def get_chart(symbol: str, period: str = "1mo"):
    from services.stockService import get_chart_data
    return get_chart_data(symbol.upper(), period)

@app.get("/api/screener")
def screener(
    sector: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_change: Optional[float] = None,
    min_cap: Optional[float] = None,
    sort_by: str = "market_cap",
    sort_dir: str = "desc"
):
    import math
    stocks = get_multiple_stocks(None)
    if sector and sector != "All":
        stocks = [s for s in stocks if s.get("sector") == sector]
    if min_price is not None:
        stocks = [s for s in stocks if s["price"] >= min_price]
    if max_price is not None:
        stocks = [s for s in stocks if s["price"] <= max_price]
    if min_change is not None:
        stocks = [s for s in stocks if s["change_pct"] >= min_change]
    if min_cap is not None:
        stocks = [s for s in stocks if s.get("market_cap", 0) >= min_cap * 1e9]
    stocks.sort(key=lambda x: x.get(sort_by, 0) or 0, reverse=(sort_dir == "desc"))
    return stocks

@app.get("/health")
def health():
    return {"status": "ok"}
