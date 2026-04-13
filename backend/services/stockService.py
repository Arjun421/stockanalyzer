import yfinance as yf
import math
from concurrent.futures import ThreadPoolExecutor

TICKERS = [
    "AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "META", "NVDA", "NFLX", "AMD", "INTC",
    "JPM", "BAC", "V", "MA", "DIS", "XOM", "COIN", "PYPL", "SHOP", "CRM"
]

def safe(val, decimals=2):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 0
    return round(float(val), decimals)

def get_stock_data(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1mo")
        if hist.empty:
            return {}
        latest = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) > 1 else latest
        info = ticker.info
        fi = ticker.fast_info
        return {
            "symbol": symbol,
            "open": safe(latest["Open"]),
            "high": safe(latest["High"]),
            "low": safe(latest["Low"]),
            "close": safe(latest["Close"]),
            "volume": int(latest["Volume"]),
            "prev_close": safe(prev["Close"]),
            "change_pct": safe(((float(latest["Close"]) - float(prev["Close"])) / float(prev["Close"])) * 100),
            "name": info.get("shortName", symbol),
            "sector": info.get("sector", "Other"),
            "market_cap": info.get("marketCap", 0) or 0,
            "history": [safe(v) for v in hist["Close"].tolist()],
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return {}

def fetch_single(symbol: str) -> dict | None:
    try:
        ticker = yf.Ticker(symbol)
        fi = ticker.fast_info
        last = fi.last_price
        prev = fi.previous_close
        if not last or not prev or math.isnan(last) or math.isnan(prev):
            return None
        change = last - prev
        change_pct = (change / prev) * 100
        hist = ticker.history(period="5d")
        sparkline = [safe(v) for v in hist["Close"].tolist()] if not hist.empty else []
        sparkline = [v for v in sparkline if v != 0]
        return {
            "symbol": symbol,
            "name": fi.currency and symbol or symbol,
            "price": safe(last),
            "high": safe(fi.day_high),
            "low": safe(fi.day_low),
            "change": safe(change),
            "change_pct": safe(change_pct),
            "volume": int(fi.three_month_average_volume or 0),
            "market_cap": int(fi.market_cap or 0),
            "sector": "Other",
            "sparkline": sparkline,
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def get_multiple_stocks(tickers=None):
    symbols = tickers if tickers else TICKERS
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_single, symbols))
    return [r for r in results if r]

def get_chart_data(symbol: str, period: str = "1mo") -> list:
    import math
    interval_map = {
        "1d": "5m", "5d": "15m", "1mo": "1d",
        "3mo": "1d", "6mo": "1wk", "1y": "1wk", "5y": "1mo"
    }
    interval = interval_map.get(period, "1d")
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        if hist.empty:
            return []
        candles = []
        for ts, row in hist.iterrows():
            o, h, l, c, v = float(row["Open"]), float(row["High"]), float(row["Low"]), float(row["Close"]), float(row["Volume"])
            if any(math.isnan(x) for x in [o, h, l, c]):
                continue
            candles.append({
                "time": int(ts.timestamp()),
                "open": round(o, 2), "high": round(h, 2),
                "low": round(l, 2), "close": round(c, 2),
                "volume": int(v) if not math.isnan(v) else 0,
            })
        return candles
    except Exception as e:
        return []
