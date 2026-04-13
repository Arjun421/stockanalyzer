"use client";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  high: number;
  low: number;
  volume: number;
  market_cap: number;
  sector: string;
  sparkline: number[];
}

function fmt(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  return n?.toString() ?? "-";
}

export default function StockCard({ stock, onClick }: { stock: StockData; onClick?: () => void }) {
  const isUp = stock.change >= 0;
  const chartData = stock.sparkline.map((v) => ({ v }));
  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <div onClick={onClick}
      className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 hover:border-blue-500/50 hover:bg-[#1e2130] transition-all cursor-pointer group">

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2a2d3a] flex items-center justify-center">
            <BarChart2 size={14} className="text-blue-400" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">{stock.symbol}</div>
            <div className="text-gray-500 text-xs truncate max-w-[100px]">{stock.name}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {isUp ? "+" : ""}{stock.change_pct.toFixed(2)}%
        </span>
      </div>

      {/* Sparkline */}
      {chartData.length > 1 && (
        <div className="h-12 mb-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-white font-bold text-lg">${stock.price.toFixed(2)}</div>
          <div className={`flex items-center gap-1 text-xs ${isUp ? "text-green-400" : "text-red-400"}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? "+" : ""}{stock.change.toFixed(2)} today
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <div className="text-gray-600 text-xs">Vol {fmt(stock.volume)}</div>
          <div className="text-gray-600 text-xs">Cap {fmt(stock.market_cap)}</div>
        </div>
      </div>

      {/* H/L bar */}
      <div className="mt-3 pt-3 border-t border-[#2a2d3a] flex items-center justify-between text-xs text-gray-600">
        <span>L ${stock.low.toFixed(2)}</span>
        <div className="flex-1 mx-2 h-1 bg-[#2a2d3a] rounded-full overflow-hidden">
          <div className="h-full bg-blue-500/50 rounded-full"
            style={{ width: `${Math.min(100, ((stock.price - stock.low) / (stock.high - stock.low || 1)) * 100)}%` }} />
        </div>
        <span>H ${stock.high.toFixed(2)}</span>
      </div>
    </div>
  );
}
