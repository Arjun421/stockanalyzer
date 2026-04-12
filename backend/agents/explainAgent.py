def explain(stock_data: dict, master: dict, technical: dict, news: dict, risk: dict) -> dict:
    symbol = stock_data.get("symbol", "")
    decision = master["decision"]
    confidence = master["confidence"]

    summary = f"{symbol} — {decision} with {confidence}% confidence. {master['market_condition']} market condition."

    detail = {
        "technical": {
            "signal": technical["signal"],
            "score": technical["score"],
            "volatility": f"{technical['volatility']}%",
            "interpretation": (
                "Strong bullish momentum" if technical["score"] >= 70
                else "Bearish pressure" if technical["score"] <= 40
                else "Consolidating"
            )
        },
        "news": {
            "sentiment": news["sentiment"],
            "score": news["score"],
            "positive_signals": news["positive"],
            "negative_signals": news["negative"],
            "articles_analyzed": news["total"],
            "interpretation": (
                f"{news['positive']} positive vs {news['negative']} negative signals across {news['total']} articles"
            )
        },
        "risk": {
            "level": risk["risk"],
            "score": risk["score"],
            "daily_volatility": f"{risk['daily_volatility']}%",
            "interpretation": (
                "Safe to enter" if risk["risk"] == "LOW"
                else "Exercise caution" if risk["risk"] == "MEDIUM"
                else "High risk — wait for stability"
            )
        }
    }

    return {"summary": summary, "detail": detail}
