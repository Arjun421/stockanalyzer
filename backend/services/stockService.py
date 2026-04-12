import yfinance as yf

def get_stock_data(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1mo")
    if hist.empty:
        return {}

    latest = hist.iloc[-1]
    prev = hist.iloc[-2] if len(hist) > 1 else latest

    info = ticker.info

    return {
        "symbol": symbol,
        "open": round(float(latest["Open"]), 2),
        "high": round(float(latest["High"]), 2),
        "low": round(float(latest["Low"]), 2),
        "close": round(float(latest["Close"]), 2),
        "volume": int(latest["Volume"]),
        "prev_close": round(float(prev["Close"]), 2),
        "change_pct": round(((float(latest["Close"]) - float(prev["Close"])) / float(prev["Close"])) * 100, 2),
        "name": info.get("shortName", symbol),
        "sector": info.get("sector", "Unknown"),
        "market_cap": info.get("marketCap", 0),
        "history": [round(float(v), 2) for v in hist["Close"].tolist()],
    }
