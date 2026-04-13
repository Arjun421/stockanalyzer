"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2, RefreshCw, PieChart, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import AddHolding, { Holding } from "@/components/AddHolding";
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

interface HoldingWithLive extends Holding {
  cmp: number;
  currentVal: number;
  invested: number;
  pnl: number;
  pnlPct: number;
  dayChange: number;
  dayChangePct: number;
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [live, setLive] = useState<HoldingWithLive[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) setHoldings(JSON.parse(saved));
  }, []);

  const fetchLive = useCallback(async (h: Holding[]) => {
    if (h.length === 0) { setLive([]); return; }
    setLoading(true);
    try {
      const symbols = h.map(x => x.symbol).join(",");
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/stocks?symbols=${symbols}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const map = Object.fromEntries(data.map((d: any) => [d.symbol, d]));
      const enriched: HoldingWithLive[] = h.map(holding => {
        const live = map[holding.symbol];
        const cmp = live?.price ?? holding.avgPrice;
        const currentVal = cmp * holding.qty;
        const invested = holding.avgPrice * holding.qty;
        const pnl = currentVal - invested;
        const pnlPct = (pnl / invested) * 100;
        const dayChange = (live?.change ?? 0) * holding.qty;
        const dayChangePct = live?.change_pct ?? 0;
        return { ...holding, cmp, currentVal, invested, pnl, pnlPct, dayChange, dayChangePct };
      });
      setLive(enriched);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLive(holdings);
    const i = setInterval(() => fetchLive(holdings), 60000);
    return () => clearInterval(i);
  }, [holdings, fetchLive]);

  function addHolding(h: Holding) {
    const updated = [...holdings.filter(x => x.symbol !== h.symbol), h];
    setHoldings(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
  }

  function removeHolding(symbol: string) {
    const updated = holdings.filter(h => h.symbol !== symbol);
    setHoldings(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
  }

  const totalInvested = live.reduce((a, h) => a + h.invested, 0);
  const totalCurrent = live.reduce((a, h) => a + h.currentVal, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested ? (totalPnl / totalInvested) * 100 : 0;
  const dayPnl = live.reduce((a, h) => a + h.dayChange, 0);
  const isUp = totalPnl >= 0;
  const isDayUp = dayPnl >= 0;

  const pieData = live.map(h => ({ name: h.symbol, value: parseFloat(h.currentVal.toFixed(2)) }));

  return (
    <div className="p-6 space-y-6">
      {showAdd && <AddHolding onAdd={addHolding} onClose={() => setShowAdd(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Portfolio</h1>
          <p className="text-gray-500 text-xs mt-0.5">{lastUpdated ? `Updated ${lastUpdated}` : "Add stocks to get started"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchLive(holdings)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors font-medium">
            <Plus size={14} /> Add Stock
          </button>
        </div>
      </div>

      {live.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Wallet size={40} className="text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">No holdings yet</p>
          <p className="text-gray-600 text-sm mt-1">Click "Add Stock" to start tracking your portfolio</p>
        </div>
      ) : (
        <>
          {/* Summary cards — Kite style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Invested", value: `$${totalInvested.toFixed(2)}`, sub: null, icon: Wallet, color: "text-gray-300" },
              { label: "Current Value", value: `$${totalCurrent.toFixed(2)}`, sub: null, icon: PieChart, color: "text-blue-400" },
              {
                label: "Total P&L", value: `${isUp ? "+" : ""}$${totalPnl.toFixed(2)}`,
                sub: `${isUp ? "+" : ""}${totalPnlPct.toFixed(2)}%`,
                icon: isUp ? TrendingUp : TrendingDown, color: isUp ? "text-green-400" : "text-red-400"
              },
              {
                label: "Day's P&L", value: `${isDayUp ? "+" : ""}$${dayPnl.toFixed(2)}`,
                sub: "today", icon: isDayUp ? ArrowUpRight : ArrowDownRight,
                color: isDayUp ? "text-green-400" : "text-red-400"
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">{label}</span>
                  <Icon size={14} className={color} />
                </div>
                <div className={`text-lg font-bold ${color}`}>{value}</div>
                {sub && <div className={`text-xs mt-0.5 ${color} opacity-70`}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* Holdings table + Pie chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Holdings table */}
            <div className="lg:col-span-2 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2d3a]">
                <h2 className="text-white text-sm font-semibold">Holdings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-[#2a2d3a]">
                      <th className="text-left px-5 py-3 font-medium">Stock</th>
                      <th className="text-right px-3 py-3 font-medium">Qty</th>
                      <th className="text-right px-3 py-3 font-medium">Avg</th>
                      <th className="text-right px-3 py-3 font-medium">CMP</th>
                      <th className="text-right px-3 py-3 font-medium">Invested</th>
                      <th className="text-right px-3 py-3 font-medium">Current</th>
                      <th className="text-right px-3 py-3 font-medium">P&L</th>
                      <th className="text-right px-3 py-3 font-medium">Day</th>
                      <th className="px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {live.map((h, i) => (
                      <tr key={h.symbol} className="border-b border-[#2a2d3a]/50 hover:bg-[#22253a] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <div>
                              <div className="text-white font-semibold">{h.symbol}</div>
                              <div className="text-gray-600 truncate max-w-[80px]">{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right px-3 py-3.5 text-gray-300">{h.qty}</td>
                        <td className="text-right px-3 py-3.5 text-gray-300">${h.avgPrice.toFixed(2)}</td>
                        <td className="text-right px-3 py-3.5 text-white font-medium">${h.cmp.toFixed(2)}</td>
                        <td className="text-right px-3 py-3.5 text-gray-300">${h.invested.toFixed(2)}</td>
                        <td className="text-right px-3 py-3.5 text-white">${h.currentVal.toFixed(2)}</td>
                        <td className="text-right px-3 py-3.5">
                          <div className={h.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                            {h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)}
                          </div>
                          <div className={`text-xs opacity-70 ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%
                          </div>
                        </td>
                        <td className="text-right px-3 py-3.5">
                          <span className={`text-xs ${h.dayChangePct >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <button onClick={() => removeHolding(h.symbol)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allocation pie */}
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
              <h2 className="text-white text-sm font-semibold mb-4">Allocation</h2>
              <ResponsiveContainer width="100%" height={180}>
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, ""]}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {live.map((h, i) => (
                  <div key={h.symbol} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400">{h.symbol}</span>
                    </div>
                    <span className="text-gray-300">{totalCurrent ? ((h.currentVal / totalCurrent) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
