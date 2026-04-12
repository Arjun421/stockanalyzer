POSITIVE_WORDS = [
    "growth", "profit", "surge", "gain", "rise", "strong", "beat", "record",
    "upgrade", "buy", "bullish", "positive", "up", "high", "boost", "rally",
    "outperform", "expand", "revenue", "success", "win", "increase"
]

NEGATIVE_WORDS = [
    "loss", "fall", "drop", "decline", "weak", "miss", "cut", "sell",
    "bearish", "negative", "down", "low", "risk", "crash", "warn",
    "underperform", "shrink", "debt", "fail", "decrease", "concern"
]

def analyze(news_list: list) -> dict:
    if not news_list:
        return {"score": 50, "sentiment": "NEUTRAL", "positive": 0, "negative": 0, "total": 0}

    positive = 0
    negative = 0

    for article in news_list:
        text = (article.get("headline", "") + " " + article.get("summary", "")).lower()
        for word in POSITIVE_WORDS:
            if word in text:
                positive += 1
        for word in NEGATIVE_WORDS:
            if word in text:
                negative += 1

    total = positive + negative
    if total == 0:
        score = 50
    else:
        score = int((positive / total) * 100)

    if score >= 60:
        sentiment = "POSITIVE"
    elif score <= 40:
        sentiment = "NEGATIVE"
    else:
        sentiment = "NEUTRAL"

    return {
        "score": score,
        "sentiment": sentiment,
        "positive": positive,
        "negative": negative,
        "total": len(news_list)
    }
