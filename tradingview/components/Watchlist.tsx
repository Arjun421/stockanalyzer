"use client";
import { Star, TrendingUp, TrendingDown, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

interface WatchItem {
  symbol: string;
  price: number;
  change_pct: number;
}

export default function Watchlist({ onSelectStock }: { onSelectStock?: (symbol: string) => void }) {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  async function addSymbol() {
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;
    if (watchlist.find((w) => w.symbol === symbol)) {
      setError("Already in watchlist");
      return;
    }

    setError("");
    try {
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/stocks?symbols=${symbol}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError("Symbol not found");
        return;
      }
      const s = data[0];
      const updated = [...watchlist, { symbol: s.symbol, price: s.price, change_pct: s.change_pct }];
      setWatchlist(updated);
      localStorage.setItem("watchlist", JSON.stringify(updated));
      setInput("");
    } catch {
      setError("Failed to fetch");
    }
  }

  function removeSymbol(symbol: string) {
    const updated = watchlist.filter((w) => w.symbol !== symbol);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }

  return (
    <div className="w-56 bg-[#1a1d27] border-l border-[#2a2d3a] flex flex-col">
      <div className="px-4 py-3 border-b border-[#2a2d3a] flex items-center gap-2">
        <Star size={14} className="text-yellow-400" />
        <span className="text-white text-sm font-medium">Watchlist</span>
      </div>

      {/* Add symbol */}
      <div className="px-3 py-2 border-b border-[#2a2d3a]">
        <div className="flex gap-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="Add symbol..."
            className="flex-1 bg-[#0e0f14] border border-[#2a2d3a] rounded text-xs px-2 py-1.5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button onClick={addSymbol} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1.5 transition-colors">
            <Plus size={12} />
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.length === 0 ? (
          <div className="text-gray-600 text-xs text-center mt-8 px-4">Add symbols to track them here</div>
        ) : (
          watchlist.map((s) => (
            <div key={s.symbol} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#22253a] cursor-pointer border-b border-[#2a2d3a]/50 group"
              onClick={() => onSelectStock?.(s.symbol)}>
              <div>
                <div className="text-white text-xs font-bold">{s.symbol}</div>
                <div className={`flex items-center gap-0.5 text-xs ${s.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {s.change_pct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {s.change_pct >= 0 ? "+" : ""}{s.change_pct}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-medium">${s.price}</span>
                <button onClick={() => removeSymbol(s.symbol)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
