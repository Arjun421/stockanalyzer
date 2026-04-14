# StockAnalyzer — AI-Powered Stock Market Intelligence Platform

A production-grade stock market analysis platform that combines real-time market data, financial news, and a multi-agent AI decision engine to deliver structured investment insights.

---

## Overview

StockAnalyzer is a full-stack financial intelligence system built for investors and traders who want data-driven, explainable stock analysis. It goes beyond simple price tracking — it processes market data through multiple specialized AI agents and produces structured BUY / SELL / HOLD decisions with confidence scores, risk assessments, and reasoning.

---

## Features

### Market Dashboard
- Real-time stock prices for 20+ US equities via yfinance
- Sparkline charts, day high/low, volume, market cap
- Filter by sector — Technology, Finance, Energy, and more
- Tabs for Top Gainers, Top Losers, Most Active
- Pagination for clean browsing

### Candlestick Charts
- TradingView-style candlestick charts powered by lightweight-charts
- OHLCV data with volume bars
- Period selector — 1D, 5D, 1M, 3M, 6M, 1Y, 5Y
- Click any stock card to open full chart

### AI Analysis Engine
A hybrid multi-agent system that analyzes any stock symbol and returns a structured decision:

```json
{
  "stock": "AAPL",
  "decision": "BUY",
  "confidence": 82,
  "confidence_level": "HIGH",
  "market_condition": "BULLISH",
  "entry_signal": "GOOD",
  "time_horizon": "SHORT_TERM",
  "risk": "LOW"
}
```

**Agents:**
- **Technical Agent** — Analyzes price trend, momentum, MA20, volatility
- **News Agent** — Sentiment analysis on latest financial news
- **Risk Agent** — Calculates daily and historical volatility
- **Master Agent** — Combines all scores with weighted formula
- **Explain Agent** — Produces human-readable breakdown

### Stock Screener
- Filter stocks by sector, price range, change %, market cap
- Sortable columns — price, change, volume, market cap
- Export results to CSV
- Click any row to open chart

### Portfolio Tracker
- Add holdings with symbol, quantity, and average buy price
- Real-time P&L calculation — unrealized gains/losses
- Day's P&L tracking
- Allocation pie chart
- Persistent storage via localStorage

### News Feed
- Real-time financial news powered by Finnhub API
- Category tabs — Latest, Markets, Crypto, M&A
- Stock-specific news — filter by symbol
- Trending news sidebar

### Watchlist
- Add any stock symbol to your personal watchlist
- Real-time price and change % updates
- Click to open chart
- Persistent across sessions

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| lightweight-charts | Candlestick charts |
| Recharts | Sparklines, pie charts |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | High-performance Python API |
| yfinance | Real-time stock data (no API key) |
| Finnhub | Financial news API |
| Python 3.12 | Runtime |
| Uvicorn | ASGI server |

---

## Project Structure

```
stockanalyzer/
├── backend/
│   ├── agents/
│   │   ├── technicalAgent.py    # Price trend & momentum analysis
│   │   ├── newsAgent.py         # Sentiment scoring
│   │   ├── riskAgent.py         # Volatility assessment
│   │   ├── masterAgent.py       # Decision engine
│   │   └── explainAgent.py      # Human-readable output
│   ├── services/
│   │   ├── stockService.py      # yfinance data fetching
│   │   └── newsService.py       # Finnhub news fetching
│   ├── main.py                  # FastAPI entry point
│   └── requirements.txt
└── tradingview/
    ├── app/
    │   ├── page.tsx             # Market dashboard
    │   ├── portfolio/           # Portfolio tracker
    │   ├── screener/            # Stock screener
    │   ├── news/                # News feed
    │   └── ai/                  # AI analysis
    ├── components/
    │   ├── StockCard.tsx
    │   ├── StockChart.tsx
    │   ├── AIAnalysis.tsx
    │   ├── Watchlist.tsx
    │   └── ...
    └── package.json
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd tradingview
npm install
npm run dev
```

Open `http://localhost:3000`

### Environment Variables

Create `tradingview/.env.local`:
```
FINNHUB_API_KEY=your_finnhub_api_key
FLASK_API_URL=http://localhost:8000
```

---

## AI Decision Engine

The Master Agent uses a weighted scoring formula:

```
finalScore = (technical × 0.55) + (news × 0.30) + (safety × 0.20)
```

Where `safety = 100 - risk_score`

A **+5 boost** is applied when all three signals align strongly (technical > 80, news > 75, risk < 30).

**Decision thresholds:**
- `score > 75` → BUY
- `score 50–75` → HOLD  
- `score < 50` → SELL

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /analyze/{symbol}` | Full AI analysis for a stock |
| `GET /api/stocks` | Real-time prices for all tracked stocks |
| `GET /api/stocks?symbols=AAPL,TSLA` | Specific symbols |
| `GET /api/chart/{symbol}?period=1mo` | OHLCV chart data |
| `GET /api/screener` | Filtered stock screener |
| `GET /health` | Health check |

---

## Deployment

- **Backend** — Render (FastAPI)
- **Frontend** — Vercel (Next.js)

---

## Disclaimer

This platform is for educational and informational purposes only. It does not constitute financial advice. Always conduct your own research before making investment decisions.

---

Built with ❤️ using yfinance, Finnhub, FastAPI, and Next.js
