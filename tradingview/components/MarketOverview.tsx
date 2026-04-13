"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

const indices = [
  { name: "S&P 500", value: "5,204.34", change: "+0.87%", up: true },
  { name: "NASDAQ", value: "16,248.52", change: "+1.12%", up: true },
  { name: "DOW", value: "38,904.04", change: "-0.23%", up: false },
  { name: "BTC/USD", value: "71,204.00", change: "+2.45%", up: true },
  { name: "ETH/USD", value: "3,812.50", change: "+1.87%", up: true },
  { name: "GOLD", value: "2,341.20", change: "-0.14%", up: false },
];

export default function MarketOverview() {
  return (
    <div className="bg-[#1a1d27] border-b border-[#2a2d3a] px-4 py-2 flex items-center gap-6 overflow-x-auto">
      {indices.map((idx) => (
        <div key={idx.name} className="flex items-center gap-2 shrink-0">
          <span className="text-gray-500 text-xs">{idx.name}</span>
          <span className="text-white text-xs font-medium">{idx.value}</span>
          <span className={`flex items-center gap-0.5 text-xs font-medium ${idx.up ? "text-green-400" : "text-red-400"}`}>
            {idx.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {idx.change}
          </span>
        </div>
      ))}
    </div>
  );
}
