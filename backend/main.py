from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.stockService import get_stock_data
from services.newsService import get_news
from agents import technicalAgent, newsAgent, riskAgent, masterAgent, explainAgent

app = FastAPI(title="Stock AI Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "stock": stock["symbol"],
        "name": stock["name"],
        "price": stock["close"],
        "change_pct": stock["change_pct"],
        "decision": master["decision"],
        "confidence": master["confidence"],
        "confidence_level": master["confidence_level"],
        "confidence_reason": master["confidence_reason"],
        "market_condition": master["market_condition"],
        "entry_signal": master["entry_signal"],
        "time_horizon": master["time_horizon"],
        "reason": master["reasons"],
        "risk": risk["risk"],
        "explanation": explanation,
        "scores": master["scores"]
    }

@app.get("/health")
def health():
    return {"status": "ok"}
