"use client";
import { useState } from "react";
import { X, Search } from "lucide-react";

export interface Holding {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
}

export default function AddHolding({ onAdd, onClose }: { onAdd: (h: Holding) => void; onClose: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [fetched, setFetched] = useState<{ name: string; price: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!symbol.trim()) return;
    setSearching(true); setError("");
    try {
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/stocks?symbols=${symbol.trim().toUpperCase()}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setFetched({ name: data[0].name, price: data[0].price });
        setAvgPrice(data[0].price.toString());
      } else { setError("Symbol not found"); }
    } catch { setError("Failed to fetch"); }
    setSearching(false);
  }

  function submit() {
    if (!symbol || !qty || !avgPrice || !fetched) return;
    onAdd({ symbol: symbol.toUpperCase(), name: fetched.name, qty: parseFloat(qty), avgPrice: parseFloat(avgPrice) });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-base">Add Holding</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Symbol search */}
        <div className="mb-4">
          <label className="text-gray-500 text-xs mb-1.5 block">Symbol</label>
          <div className="flex gap-2">
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="e.g. AAPL"
              className="flex-1 bg-[#0e0f14] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            <button onClick={lookup} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm transition-colors">
              {searching ? "..." : <Search size={16} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          {fetched && <p className="text-green-400 text-xs mt-1">{fetched.name} · CMP ₹{fetched.price}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Quantity</label>
            <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="0"
              className="w-full bg-[#0e0f14] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Avg. Buy Price ($)</label>
            <input value={avgPrice} onChange={e => setAvgPrice(e.target.value)} type="number" placeholder="0.00"
              className="w-full bg-[#0e0f14] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>
        </div>

        {qty && avgPrice && (
          <div className="bg-[#0e0f14] rounded-lg p-3 mb-4 text-xs text-gray-400">
            Invested: <span className="text-white font-medium">${(parseFloat(qty) * parseFloat(avgPrice)).toFixed(2)}</span>
          </div>
        )}

        <button onClick={submit} disabled={!fetched || !qty || !avgPrice}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          Add to Portfolio
        </button>
      </div>
    </div>
  );
}
