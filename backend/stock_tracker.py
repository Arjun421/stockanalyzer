import yfinance as yf

tickers = ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN"]

print("=" * 50)
print("       LIVE STOCK PRICES (via yfinance)")
print("=" * 50)

for symbol in tickers:
    ticker = yf.Ticker(symbol)
    info = ticker.fast_info
    print(f"{symbol:6} | Price: ${info.last_price:.2f} | High: ${info.day_high:.2f} | Low: ${info.day_low:.2f}")

print("=" * 50)
print("\n--- AAPL Last 5 Days History ---\n")
aapl = yf.Ticker("AAPL")
hist = aapl.history(period="5d")
print(hist[["Open", "High", "Low", "Close", "Volume"]].to_string())
