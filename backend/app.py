from flask import Flask, render_template, jsonify
from flask_cors import CORS
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
import math

app = Flask(__name__)
CORS(app)

TICKERS = [
    "AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "META", "NVDA", "NFLX", "AMD", "INTC",
    "UBER", "LYFT", "SNAP", "SPOT", "XYZ", "PYPL", "SHOP", "ZM", "CRM",
    "BABA", "JNJ", "JPM", "BAC", "GS", "V", "MA", "DIS", "BRK-B", "XOM", "COIN"
]

def safe(val, decimals=2):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 0
    return round(float(val), decimals)

def fetch_stock(symbol):
    try:
        ticker = yf.Ticker(symbol)
        fi = ticker.fast_info
        last = fi.last_price
        prev = fi.previous_close
        if not last or not prev or math.isnan(last) or math.isnan(prev):
            return None
        change = last - prev
        change_pct = (change / prev) * 100

        # sparkline: last 5 days only so card color matches trend
        hist = ticker.history(period="5d")
        sparkline = [safe(v) for v in hist["Close"].tolist()] if not hist.empty else []
        sparkline = [v for v in sparkline if v != 0]

        info = ticker.info
        return {
            "symbol": symbol,
            "name": info.get("shortName", symbol),
            "price": safe(last),
            "high": safe(fi.day_high),
            "low": safe(fi.day_low),
            "change": safe(change),
            "change_pct": safe(change_pct),
            "volume": info.get("regularMarketVolume") or 0,
            "market_cap": info.get("marketCap") or 0,
            "sector": info.get("sector", "Other"),
            "sparkline": sparkline,
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chart/<symbol>")
def get_chart(symbol):
    from flask import request
    import math
    period = request.args.get("period", "1mo")
    interval_map = {
        "1d": "5m", "5d": "15m", "1mo": "1d",
        "3mo": "1d", "6mo": "1wk", "1y": "1wk", "5y": "1mo"
    }
    interval = interval_map.get(period, "1d")
    try:
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period=period, interval=interval)
        if hist.empty:
            return jsonify([])
        candles = []
        for ts, row in hist.iterrows():
            o, h, l, c, v = float(row["Open"]), float(row["High"]), float(row["Low"]), float(row["Close"]), float(row["Volume"])
            if any(math.isnan(x) for x in [o, h, l, c]):
                continue
            candles.append({
                "time": int(ts.timestamp()),
                "open": round(o, 2),
                "high": round(h, 2),
                "low": round(l, 2),
                "close": round(c, 2),
                "volume": int(v) if not math.isnan(v) else 0,
            })
        return jsonify(candles)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/screener")
def screener():
    from flask import request
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_stock, TICKERS))
    stocks = [r for r in results if r]

    # filters
    sector = request.args.get("sector")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    min_change = request.args.get("min_change", type=float)
    max_change = request.args.get("max_change", type=float)
    min_cap = request.args.get("min_cap", type=float)
    sort_by = request.args.get("sort_by", "market_cap")
    sort_dir = request.args.get("sort_dir", "desc")

    if sector and sector != "All":
        stocks = [s for s in stocks if s.get("sector") == sector]
    if min_price is not None:
        stocks = [s for s in stocks if s["price"] >= min_price]
    if max_price is not None:
        stocks = [s for s in stocks if s["price"] <= max_price]
    if min_change is not None:
        stocks = [s for s in stocks if s["change_pct"] >= min_change]
    if max_change is not None:
        stocks = [s for s in stocks if s["change_pct"] <= max_change]
    if min_cap is not None:
        stocks = [s for s in stocks if s["market_cap"] >= min_cap * 1e9]

    reverse = sort_dir == "desc"
    stocks.sort(key=lambda x: x.get(sort_by, 0) or 0, reverse=reverse)
    return jsonify(stocks)

@app.route("/api/stocks")
def get_stocks():
    from flask import request
    symbols_param = request.args.get("symbols")
    if symbols_param:
        # support comma-separated symbols
        tickers = [s.strip().upper() for s in symbols_param.split(",") if s.strip()]
    else:
        tickers = TICKERS
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_stock, tickers))
    return jsonify([r for r in results if r])

if __name__ == "__main__":
    app.run(debug=True)
