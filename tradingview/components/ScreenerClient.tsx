"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw, Download, SlidersHorizontal, TrendingUp, TrendingDown, X } from "lucide-react";
import StockChart from "@/components/StockChart";
import { StockData } from "@/components/StockCard";

const SECTORS = ["All", "Technology", "Consumer Cyclical", "Communication Services", "Financial Services", "Energy", "Healthcare", "Other"];
type SortKey = "price" | "change_pct" | "volume" | "market_cap" | "high" | "low";
type SortDir = "asc" | "desc";

interface Filter {
  sector: string;
  minPrice: string;
  maxPrice: string;
  minChange: string;
  maxChange: string;
  minCap: string;
}

function fmt(n: number) {
  if (!n) return "-";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-gray-600" />;
  return sortDir === "desc" ? <ChevronDown size={12} className="text-blue-400" /> : <ChevronUp size={12} className="text-blue-400" />;
}

export default function ScreenerClient() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StockData | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("market_cap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(true);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filter>({
    sector: "All", minPrice: "", maxPrice: "",
    minChange: "", maxChange: "", minCap: "",
  });

  const run = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.sector !== "All") p.set("sector", filters.sector);
    if (filters.minPrice) p.set("min_price", filters.minPrice);
    if (filters.maxPrice) p.set("max_price", filters.maxPrice);
    if (filters.minChange) p.set("min_change", filters.minChange);
    if (filters.maxChange) p.set("max_change", filters.maxChange);
    if (filters.minCap) p.set("min_cap", filters.minCap);
    p.set("sort_by", sortKey);
    p.set("sort_dir", sortDir);
    try {
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/screener?${p}`);
      const data = await res.json();
      if (Array.isArray(data)) setStocks(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters, sortKey, sortDir]);

  useEffect(() => { run(); }, [run]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleCheck(symbol: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  function downloadCSV() {
    const rows = [["Symbol", "Name", "Price", "Change%", "Volume", "Market Cap", "Sector"]];
    stocks.forEach(s => rows.push([s.symbol, s.name, String(s.price), String(s.change_pct), String(s.volume), String(s.market_cap), s.sector]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = "screener.csv"; a.click();
  }

  function resetFilters() {
    setFilters({ sector: "All", minPrice: "", maxPrice: "", minChange: "", maxChange: "", minCap: "" });
  }

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v && v !== "All").length;

  return (
    <div className="p-6 space-y-4">
      {selected && <StockChart stock={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Stock Screener</h1>
          <p className="text-gray-500 text-xs mt-0.5">Filter and discover stocks based on fundamentals</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 hover:text-white transition-colors">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={run} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Run
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d3a]">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={15} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span onClick={resetFilters} className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors cursor-pointer">
                <X size={12} /> Reset
              </span>
            )}
            <span className="cursor-pointer text-gray-500" onClick={() => setShowFilters(v => !v)}>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </div>

        {showFilters && (
          <div className="px-5 pb-5 border-t border-[#2a2d3a]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="lg:col-span-2">
                <label className="text-gray-500 text-xs mb-1.5 block">Sector</label>
                <select value={filters.sector} onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}
                  className="w-full bg-[#0e0f14] border border-[#2a2d3a] rounded-lg px-3 py-2 text-gray-300 text-xs focus:outline-none focus:border-blue-500">
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {[
                { label: "Min Price ($)", key: "minPrice", placeholder: "0" },
                { label: "Max Price ($)", key: "maxPrice", placeholder: "∞" },
                { label: "Min Change %", key: "minChange", placeholder: "-100" },
                { label: "Min Mkt Cap (B)", key: "minCap", placeholder: "0" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-gray-500 text-xs mb-1.5 block">{label}</label>
                  <input value={filters[key as keyof Filter]}
                    onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                    type="number" placeholder={placeholder}
                    className="w-full bg-[#0e0f14] border border-[#2a2d3a] rounded-lg px-3 py-2 text-gray-300 text-xs focus:outline-none focus:border-blue-500 placeholder-gray-600" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d3a]">
          <span className="text-gray-400 text-xs">
            Showing <span className="text-white font-medium">{stocks.length}</span> results
            {checked.size > 0 && <span className="ml-2 text-blue-400">· {checked.size} selected</span>}
          </span>
          <span className="text-gray-600 text-xs">Click any row to view chart</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2d3a] text-gray-500">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="accent-blue-500"
                    onChange={e => setChecked(e.target.checked ? new Set(stocks.map(s => s.symbol)) : new Set())} />
                </th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                {([
                  { label: "Price", key: "price" },
                  { label: "Change %", key: "change_pct" },
                  { label: "Volume", key: "volume" },
                  { label: "Day High", key: "high" },
                  { label: "Day Low", key: "low" },
                  { label: "Mkt Cap", key: "market_cap" },
                ] as { label: string; key: SortKey }[]).map(({ label, key }) => (
                  <th key={key} className="text-right px-4 py-3 font-medium cursor-pointer hover:text-white select-none"
                    onClick={() => toggleSort(key)}>
                    <div className="flex items-center justify-end gap-1">
                      {label} <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium">Sector</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-500">
                  <RefreshCw size={18} className="animate-spin inline mr-2" />Scanning stocks...
                </td></tr>
              ) : stocks.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-600">No stocks match your filters</td></tr>
              ) : stocks.map((s) => {
                const isUp = s.change_pct >= 0;
                return (
                  <tr key={s.symbol} onClick={() => setSelected(s)}
                    className="border-b border-[#2a2d3a]/40 hover:bg-[#22253a] cursor-pointer transition-colors group">
                    <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleCheck(s.symbol); }}>
                      <input type="checkbox" checked={checked.has(s.symbol)} onChange={() => {}} className="accent-blue-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-6 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`} />
                        <div>
                          <div className="text-white font-semibold group-hover:text-blue-400 transition-colors">{s.symbol}</div>
                          <div className="text-gray-600 truncate max-w-[140px]">{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-4 py-3 text-white font-medium">${s.price.toFixed(2)}</td>
                    <td className="text-right px-4 py-3">
                      <span className={`flex items-center justify-end gap-1 font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isUp ? "+" : ""}{s.change_pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 text-gray-300">{fmt(s.volume)}</td>
                    <td className="text-right px-4 py-3 text-gray-300">${s.high.toFixed(2)}</td>
                    <td className="text-right px-4 py-3 text-gray-300">${s.low.toFixed(2)}</td>
                    <td className="text-right px-4 py-3 text-gray-300">{fmt(s.market_cap)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2d3a] text-gray-400">
                        {s.sector === "Communication Services" ? "Comms"
                          : s.sector === "Consumer Cyclical" ? "Consumer"
                          : s.sector === "Financial Services" ? "Finance"
                          : s.sector || "Other"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
