"use client";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Zap, Clock, BarChart2, AlertTriangle, RefreshCw } from "lucide-react";

interface AnalysisResult {
  stock: string;
  name: string;
  price: number;
  change_pct: number;
  decision: "BUY" | "SELL" | "HOLD";
  confidence: number;
  confidence_level: "HIGH" | "MEDIUM" | "LOW";
  confidence_reason: string;
  market_condition: "BULLISH" | "BEARISH" | "NEUTRAL";
  entry_signal: "GOOD" | "MODERATE" | "RISKY";
  time_horizon: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
  reason: string[];
  risk: "LOW" | "MEDIUM" | "HIGH";
  scores: { technical: number; news: number; risk: number; safety: number };
}

const DECISION_CONFIG = {
  BUY:  { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: TrendingUp,  label: "Strong Buy" },
  SELL: { color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/30",   icon: TrendingDown, label: "Strong Sell" },
  HOLD: { color: "text-yellow-400",bg: "bg-yellow-500/10",border: "border-yellow-500/30",icon: Minus,        label: "Hold Position" },
};

const CONDITION_COLOR = {
  BULLISH: "text-green-400", BEARISH: "text-red-400", NEUTRAL: "text-yellow-400",
};

const SIGNAL_COLOR = {
  GOOD: "text-green-400", MODERATE: "text-yellow-400", RISKY: "text-red-400",
};

const RISK_COLOR = {
  LOW: "text-green-400", MEDIUM: "text-yellow-400", HIGH: "text-red-400",
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className={`font-medium ${color}`}>{value}</span>
      </div>
      <div className="h-1.5 bg-[#2a2d3a] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${value >= 65 ? "bg-green-500" : value >= 45 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function AIAnalysis() {
  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!symbol.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/analyze/${symbol.trim().toUpperCase()}`);
      if (!res.ok) throw new Error("Symbol not found");
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to analyze");
    }
    setLoading(false);
  }

  const cfg = result ? DECISION_CONFIG[result.decision] : null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-white font-bold text-2xl flex items-center justify-center gap-2">
          <Zap size={22} className="text-blue-400" /> Stock AI Analysis
        </h1>
        <p className="text-gray-500 text-sm mt-1">Real-time multi-agent decision engine</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Enter symbol e.g. AAPL, TSLA, MSFT..."
            className="w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
          />
        </div>
        <button onClick={analyze} disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && cfg && (
        <>
          {/* Main Decision Card */}
          <div className={`bg-[#1a1d27] border ${cfg.border} rounded-2xl p-6`}>
            {/* Stock info */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-white font-bold text-2xl">{result.stock}</div>
                <div className="text-gray-500 text-sm">{result.name}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-xl">${result.price.toFixed(2)}</div>
                <div className={`text-sm font-medium ${result.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {result.change_pct >= 0 ? "+" : ""}{result.change_pct.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Decision — most dominant */}
            <div className={`${cfg.bg} rounded-xl p-5 text-center mb-5`}>
              <div className={`flex items-center justify-center gap-2 ${cfg.color} mb-1`}>
                <cfg.icon size={28} strokeWidth={2.5} />
                <span className="text-4xl font-black tracking-wide">{result.decision}</span>
              </div>
              <div className={`text-sm font-semibold ${cfg.color} opacity-80`}>{cfg.label}</div>
            </div>

            {/* Confidence bar */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs font-medium">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    result.confidence_level === "HIGH" ? "bg-green-500/10 text-green-400" :
                    result.confidence_level === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-red-500/10 text-red-400"}`}>
                    {result.confidence_level}
                  </span>
                  <span className="text-white font-bold text-lg">{result.confidence}%</span>
                </div>
              </div>
              <div className="h-3 bg-[#0e0f14] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${cfg.color.replace("text-", "bg-").replace("-400", "-500")}`}
                  style={{ width: `${result.confidence}%` }} />
              </div>
              <p className="text-gray-600 text-xs mt-1.5 italic">{result.confidence_reason}</p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Market", value: result.market_condition.replace("_", " "), color: CONDITION_COLOR[result.market_condition], icon: BarChart2 },
                { label: "Entry Signal", value: result.entry_signal, color: SIGNAL_COLOR[result.entry_signal], icon: Zap },
                { label: "Time Horizon", value: result.time_horizon.replace("_", " "), color: "text-blue-400", icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-[#0e0f14] rounded-xl p-3 text-center">
                  <Icon size={16} className={`${color} mx-auto mb-1.5`} />
                  <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                  <div className={`font-bold text-xs ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Scores */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Agent Scores</h3>
            <div className="space-y-3">
              <ScoreBar label="Technical Analysis" value={result.scores.technical} color={result.scores.technical >= 65 ? "text-green-400" : "text-red-400"} />
              <ScoreBar label="News Sentiment" value={result.scores.news} color={result.scores.news >= 65 ? "text-green-400" : "text-red-400"} />
              <ScoreBar label="Safety Score" value={result.scores.safety} color={result.scores.safety >= 65 ? "text-green-400" : "text-red-400"} />
            </div>
          </div>

          {/* Reasons */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-3">Analysis Breakdown</h3>
            <div className="space-y-2">
              {result.reason.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.color.replace("text-", "bg-")}`} />
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Risk badge */}
          <div className="flex items-center justify-between bg-[#1a1d27] border border-[#2a2d3a] rounded-xl px-5 py-3">
            <span className="text-gray-500 text-xs">Risk Level</span>
            <span className={`text-sm font-bold ${RISK_COLOR[result.risk]}`}>
              {result.risk} RISK
            </span>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-gray-700 text-xs">
            AI-powered insights • Not financial advice • Always do your own research
          </p>
        </>
      )}

      {!result && !loading && !error && (
        <div className="text-center py-16 text-gray-700">
          <Zap size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a stock symbol to get AI analysis</p>
        </div>
      )}
    </div>
  );
}
