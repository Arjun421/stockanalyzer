def analyze(stock_data: dict) -> dict:
    close = stock_data["close"]
    open_ = stock_data["open"]
    high = stock_data["high"]
    low = stock_data["low"]
    history = stock_data.get("history", [])

    score = 50  # neutral base

    # 1. Candle direction
    if close > open_:
        score += 12
    elif close < open_:
        score -= 12

    # 2. Volatility
    volatility = (high - low) / close if close else 0
    if volatility < 0.015:
        score += 10
    elif volatility < 0.03:
        score += 5
    elif volatility > 0.05:
        score -= 10

    # 3. Short-term momentum (5 days)
    if len(history) >= 5:
        recent = history[-5:]
        if recent[-1] > recent[0]:
            pct = ((recent[-1] - recent[0]) / recent[0]) * 100
            score += min(15, int(pct * 2))
        else:
            pct = ((recent[0] - recent[-1]) / recent[0]) * 100
            score -= min(15, int(pct * 2))

    # 4. Medium-term trend (20 days)
    if len(history) >= 20:
        ma20 = sum(history[-20:]) / 20
        if close > ma20:
            score += 10
        else:
            score -= 10

    # 5. Daily change %
    change = stock_data.get("change_pct", 0)
    if change > 3:
        score += 8
    elif change > 1:
        score += 4
    elif change < -3:
        score -= 8
    elif change < -1:
        score -= 4

    score = max(0, min(100, score))

    if score >= 62:
        signal = "BUY"
    elif score <= 42:
        signal = "SELL"
    else:
        signal = "HOLD"

    return {
        "score": score,
        "signal": signal,
        "volatility": round(volatility * 100, 2)
    }
