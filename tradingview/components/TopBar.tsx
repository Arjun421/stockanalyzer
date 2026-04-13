"use client";
import { Search, Bell, Settings, ChevronDown, BarChart2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
}

export default function TopBar({ onSelectStock }: { onSelectStock?: (symbol: string) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/stocks?symbols=${search.trim().toUpperCase()}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setOpen(true);
        } else {
          setResults([]);
        }
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <header className="h-12 bg-[#1a1d27] border-b border-[#2a2d3a] flex items-center px-4 gap-4 z-50">
      <div className="flex items-center gap-2 min-w-[140px]">
        <BarChart2 className="text-blue-500" size={20} />
        <span className="text-white font-bold text-sm tracking-wide">TradeView</span>
      </div>

      <nav className="hidden md:flex items-center gap-1 text-xs text-gray-400">
        {["Markets", "Charts", "Screener", "News", "Ideas"].map((item) => (
          <button key={item} className="px-3 py-1.5 hover:text-white hover:bg-[#2a2d3a] rounded transition-colors">{item}</button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-sm relative" ref={ref}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search symbol e.g. AAPL..."
          className="w-full bg-[#0e0f14] border border-[#2a2d3a] rounded text-xs pl-8 pr-8 py-1.5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
        {search && (
          <button onClick={() => { setSearch(""); setResults([]); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X size={12} />
          </button>
        )}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-lg shadow-xl z-50 overflow-hidden">
            {results.map((r) => (
              <div key={r.symbol} onClick={() => { onSelectStock?.(r.symbol); setOpen(false); setSearch(""); }}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#2a2d3a] cursor-pointer">
                <div>
                  <div className="text-white text-xs font-bold">{r.symbol}</div>
                  <div className="text-gray-500 text-xs">{r.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-xs">${r.price}</div>
                  <div className={`text-xs ${r.change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {r.change_pct >= 0 ? "+" : ""}{r.change_pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="absolute top-full mt-1 w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-lg px-4 py-3 text-gray-500 text-xs">
            Searching...
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="text-gray-400 hover:text-white transition-colors"><Bell size={16} /></button>
        <button className="text-gray-400 hover:text-white transition-colors"><Settings size={16} /></button>
        <div className="flex items-center gap-2 bg-[#2a2d3a] rounded px-3 py-1.5 cursor-pointer hover:bg-[#353849]">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">A</div>
          <span className="text-xs text-gray-300">Arjun</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
