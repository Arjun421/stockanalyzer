"use client";
import { useState, useEffect } from "react";
import StockCard, { StockData } from "@/components/StockCard";
import StockChart from "@/components/StockChart";
import { Filter, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, BarChart2 } from "lucide-react";

const FILTERS = ["All", "Technology", "Consumer Cyclical", "Communication Services", "Financial Services", "Energy"];
const PAGE_SIZE = 9;

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("default");
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "gainers" | "losers" | "active">("overview");

  async function fetchStocks() {
    setLoading(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://stockanalyzer-1-83j9.onrender.com";
      const res = await fetch(`${BACKEND}/api/stocks`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStocks(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchStocks(); const i = setInterval(fetchStocks, 60000); return () => clearInterval(i); }, []);
  useEffect(() => setPage(1), [filter, sort, activeTab]);

  const base = activeTab === "gainers" ? [...stocks].sort((a, b) => b.change_pct - a.change_pct)
    : activeTab === "losers" ? [...stocks].sort((a, b) => a.change_pct - b.change_pct)
    : activeTab === "active" ? [...stocks].sort((a, b) => (b.volume || 0) - (a.volume || 0))
    : stocks.filter((s) => filter === "All" || s.sector === filter).sort((a, b) =>
        sort === "price" ? b.price - a.price : sort === "change" ? b.change_pct - a.change_pct : sort === "volume" ? (b.volume||0)-(a.volume||0) : 0
      );

  const totalPages = Math.ceil(base.length / PAGE_SIZE);
  const paginated = base.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const avgChange = stocks.length ? stocks.reduce((a, s) => a + s.change_pct, 0) / stocks.length : 0;

  return (
    <div className="p-6 space-y-6">
      {selectedStock && <StockChart stock={selectedStock} onClose={() => setSelectedStock(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Market Overview</h1>
          <p className="text-gray-500 text-xs mt-0.5">{lastUpdated ? `Updated ${lastUpdated} · auto-refreshes every 60s` : "Loading..."}</p>
        </div>
        <button onClick={fetchStocks} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading && stocks.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
          <RefreshCw size={18} className="animate-spin" /> Fetching live prices...
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Tracked", value: stocks.length, icon: BarChart2, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Gainers", value: stocks.filter(s => s.change > 0).length, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Losers", value: stocks.filter(s => s.change < 0).length, icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
              { label: "Avg Change", value: (avgChange >= 0 ? "+" : "") + avgChange.toFixed(2) + "%", icon: Activity, color: avgChange >= 0 ? "text-green-400" : "text-red-400", bg: avgChange >= 0 ? "bg-green-500/10" : "bg-red-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 flex items-center gap-3">
                <div className={`${bg} ${color} p-2 rounded-lg`}><Icon size={16} /></div>
                <div>
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs + controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-1 gap-1">
              {[
                { key: "overview", label: "All" },
                { key: "gainers", label: "🚀 Gainers" },
                { key: "losers", label: "📉 Losers" },
                { key: "active", label: "⚡ Active" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium
                    ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {FILTERS.map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                        ${filter === f ? "bg-blue-500 border-blue-500 text-white" : "border-[#2a2d3a] text-gray-500 hover:text-white hover:border-gray-500"}`}>
                      {f === "Communication Services" ? "Comms" : f === "Consumer Cyclical" ? "Consumer" : f === "Financial Services" ? "Finance" : f}
                    </button>
                  ))}
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 text-xs rounded-lg px-2 py-1.5 focus:outline-none">
                  <option value="default">Default</option>
                  <option value="price">Price ↓</option>
                  <option value="change">Change % ↓</option>
                  <option value="volume">Volume ↓</option>
                </select>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} onClick={() => setSelectedStock(stock)} />
            ))}
          </div>

          {/* Pagination — only Prev / Next */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-gray-500 text-xs">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
