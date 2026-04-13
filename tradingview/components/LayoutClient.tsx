"use client";
import { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import MarketOverview from "./MarketOverview";
import Watchlist from "./Watchlist";
import StockChart from "./StockChart";
import { StockData } from "./StockCard";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [searchedStock, setSearchedStock] = useState<StockData | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  async function handleSelectStock(symbol: string) {
    setLoadingSearch(true);
    try {
      const res = await fetch(`https://stockanalyzer-1-83j9.onrender.com/api/stocks?symbols=${symbol}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setSearchedStock(data[0]);
    } catch {}
    setLoadingSearch(false);
  }

  return (
    <>
      <TopBar onSelectStock={handleSelectStock} />
      <MarketOverview />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Watchlist onSelectStock={handleSelectStock} />
      </div>
      {searchedStock && <StockChart stock={searchedStock} onClose={() => setSearchedStock(null)} />}
      {loadingSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white text-sm">
          Loading...
        </div>
      )}
    </>
  );
}
