import finnhub
import os
from datetime import datetime, timedelta

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d7b0s9pr01qtpbha494gd7b0s9pr01qtpbha4950")

def get_news(symbol: str) -> list:
    client = finnhub.Client(api_key=FINNHUB_API_KEY)
    to_date = datetime.now().strftime("%Y-%m-%d")
    from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    # strip exchange suffix for finnhub (e.g. RELIANCE.NS -> RELIANCE)
    clean_symbol = symbol.split(".")[0]
    news = client.company_news(clean_symbol, _from=from_date, to=to_date)
    return news[:20] if news else []
