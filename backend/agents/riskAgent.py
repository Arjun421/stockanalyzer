def analyze(stock_data: dict) -> dict:
    close = stock_data["close"]
    high = stock_data["high"]
    low = stock_data["low"]
    history = stock_data.get("history", [])

    # Daily volatility
    daily_vol = ((high - low) / close * 100) if close else 0

    # Historical volatility (std dev of returns)
    hist_vol = 0
    if len(history) >= 5:
        returns = [(history[i] - history[i-1]) / history[i-1] * 100
                   for i in range(1, len(history)) if history[i-1] != 0]
        if returns:
            mean = sum(returns) / len(returns)
            variance = sum((r - mean) ** 2 for r in returns) / len(returns)
            hist_vol = variance ** 0.5

    # Risk score (higher = more risk)
    risk_score = min(100, int(daily_vol * 10 + hist_vol * 5))

    if risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "score": risk_score,
        "risk": risk_level,
        "daily_volatility": round(daily_vol, 2),
        "historical_volatility": round(hist_vol, 2)
    }
