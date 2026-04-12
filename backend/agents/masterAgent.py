def analyze(technical: dict, news: dict, risk: dict) -> dict:
    t_score = max(0, min(100, technical["score"]))
    n_score = max(0, min(100, news["score"]))
    r_score = max(0, min(100, risk["score"]))

    # Convert risk to safety score (inverted)
    safety_score = 100 - r_score

    # Core formula: technical leads, news supports, safety adds stability
    raw_score = (t_score * 0.5) + (n_score * 0.3) + (safety_score * 0.2)

    # Strong signal boost — all three aligned
    if t_score > 80 and n_score > 75 and r_score < 30:
        raw_score += 5

    confidence = max(0, min(100, round(raw_score)))

    # Decision thresholds
    if confidence > 75:
        decision = "BUY"
    elif confidence < 50:
        decision = "SELL"
    else:
        decision = "HOLD"

    # Market condition — based on technical + news alignment
    if t_score > 70 and n_score > 60:
        market_condition = "BULLISH"
    elif t_score < 40 and n_score < 40:
        market_condition = "BEARISH"
    else:
        market_condition = "NEUTRAL"

    # Confidence reason
    parts = []
    if t_score > 80:
        parts.append("strong technical momentum")
    elif t_score > 60:
        parts.append("moderate technical trend")
    else:
        parts.append("weak technical signals")

    if n_score > 75:
        parts.append("positive news sentiment")
    elif n_score > 50:
        parts.append("neutral news sentiment")
    else:
        parts.append("negative news sentiment")

    if r_score < 30:
        parts.append("low risk environment")
    elif r_score < 60:
        parts.append("moderate risk")
    else:
        parts.append("high risk — caution advised")

    confidence_reason = " + ".join(parts).capitalize()

    # Reasons list
    reasons = []
    if technical["signal"] == "BUY":
        reasons.append("Upward trend detected in price action")
    elif technical["signal"] == "SELL":
        reasons.append("Downward trend detected in price action")
    else:
        reasons.append("Sideways movement — no clear trend")

    if news["sentiment"] == "POSITIVE":
        reasons.append(f"Positive market sentiment ({news['positive']} bullish signals in news)")
    elif news["sentiment"] == "NEGATIVE":
        reasons.append(f"Negative market sentiment ({news['negative']} bearish signals in news)")
    else:
        reasons.append("Neutral news sentiment")

    if risk["risk"] == "LOW":
        reasons.append("Low volatility — stable entry point")
    elif risk["risk"] == "HIGH":
        reasons.append("High volatility — risky entry, consider waiting")
    else:
        reasons.append("Moderate volatility — manageable risk")

    # --- Entry Signal ---
    if t_score > 80 and r_score < 30:
        entry_signal = "GOOD"
    elif t_score > 60:
        entry_signal = "MODERATE"
    else:
        entry_signal = "RISKY"

    # --- Time Horizon (from technical volatility) ---
    volatility = technical.get("volatility", 0)
    if volatility < 2:
        time_horizon = "SHORT_TERM"
    elif volatility < 5:
        time_horizon = "MID_TERM"
    else:
        time_horizon = "LONG_TERM"

    # --- Confidence Level Tag ---
    if confidence > 80:
        confidence_level = "HIGH"
    elif confidence > 60:
        confidence_level = "MEDIUM"
    else:
        confidence_level = "LOW"

    return {
        "decision": decision,
        "confidence": confidence,
        "confidence_level": confidence_level,
        "confidence_reason": confidence_reason,
        "market_condition": market_condition,
        "entry_signal": entry_signal,
        "time_horizon": time_horizon,
        "reasons": reasons,
        "scores": {
            "technical": t_score,
            "news": n_score,
            "risk": r_score,
            "safety": safety_score
        }
    }
