"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from "lightweight-charts";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { StockData } from "./StockCard";

const PERIODS = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"];

export default function StockChart({ stock, onClose }: { stock: StockData; onClose: () => void }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState("1mo");
  const [loading, setLoading] = useState(true);

  const isUp = stock.change >= 0;

  useEffect(() => {
    if (!chartRef.current || !volRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: "#0e0f14" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#2a2d3a" },
      timeScale: { borderColor: "#2a2d3a", timeVisible: true },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
    });

    const volChart = createChart(volRef.current, {
      layout: { background: { type: ColorType.Solid, color: "#0e0f14" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      rightPriceScale: { borderColor: "#2a2d3a" },
      timeScale: { borderColor: "#2a2d3a", timeVisible: true },
      width: volRef.current.clientWidth,
      height: volRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volSeries = volChart.addSeries(HistogramSeries, {
      color: "#3b82f6",
      priceFormat: { type: "volume" },
    });

    setLoading(true);
    fetch(`https://stockanalyzer-1-83j9.onrender.com/api/chart/${stock.symbol}?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setLoading(false);
          return;
        }
        candleSeries.setData(data.map((d) => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));
        volSeries.setData(data.map((d) => ({ time: d.time, value: d.volume, color: d.close >= d.open ? "#22c55e44" : "#ef444444" })));
        chart.timeScale().fitContent();
        volChart.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // sync timescales
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) volChart.timeScale().setVisibleLogicalRange(range);
    });

    const ro = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
      if (volRef.current) volChart.applyOptions({ width: volRef.current.clientWidth });
    });
    if (chartRef.current) ro.observe(chartRef.current);

    return () => {
      chart.remove();
      volChart.remove();
      ro.disconnect();
    };
  }, [stock.symbol, period]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e0f14] border border-[#2a2d3a] rounded-xl w-full max-w-5xl flex flex-col" style={{ height: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d3a]">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white font-bold text-lg">{stock.symbol}</span>
              <span className="text-gray-500 text-sm ml-2">{stock.name}</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 text-sm font-medium flex-inline items-center gap-1 ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? "▲" : "▼"} {stock.change.toFixed(2)} ({stock.change_pct.toFixed(2)}%)
              </span>
            </div>
            <div className="text-gray-500 text-xs">H: ${stock.high} &nbsp; L: ${stock.low}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-[#2a2d3a]">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1 rounded transition-colors ${period === p ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2d3a]"}`}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="flex-1 flex flex-col p-3 gap-2 min-h-0">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-10">
              Loading chart...
            </div>
          )}
          <div ref={chartRef} className="flex-1 min-h-0 w-full" />
          <div ref={volRef} className="w-full" style={{ height: "80px" }} />
        </div>
      </div>
    </div>
  );
}
