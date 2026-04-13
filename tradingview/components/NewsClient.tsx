"use client";
import { useState, useEffect } from "react";
import { Clock, ExternalLink, TrendingUp, Newspaper, RefreshCw, Zap } from "lucide-react";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  related: string;
}

const CATEGORIES = [
  { key: "general", label: "Latest" },
  { key: "forex", label: "Markets" },
  { key: "crypto", label: "Crypto" },
  { key: "merger", label: "M&A" },
];

const TRENDING_SYMBOLS = ["AAPL", "NVDA", "TSLA", "META", "GOOGL", "AMZN", "MSFT"];

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts * 1000) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NewsImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErr(true)} referrerPolicy="no-referrer" />
  );
}

export default function NewsClient() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("general");
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [stockSymbol, setStockSymbol] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [visible, setVisible] = useState(6);

  async function fetchNews(cat: string, sym?: string) {
    setLoading(true);
    setVisibleCount(5);
    try {
      const url = sym ? `/api/news?symbol=${sym}` : `/api/news?category=${cat}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
      else setNews([]);
    } catch (e) { console.error(e); setNews([]); }
    setLoading(false);
  }

  async function fetchTrending() {
    try {
      const res = await fetch(`/api/news?symbol=AAPL`);
      const data = await res.json();
      if (Array.isArray(data)) setTrendingNews(data.slice(0, 5));
    } catch {}
  }

  useEffect(() => { fetchNews("general"); fetchTrending(); }, []);

  function handleCategory(cat: string) {
    setCategory(cat); setStockSymbol(""); setVisible(6); fetchNews(cat);
  }

  function handleStockNews(sym: string) {
    setStockSymbol(sym); setVisible(6); fetchNews("", sym);
  }

  const featured = news[0];
  const rest = news.slice(1, visible);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl flex items-center gap-2">
            <Newspaper size={20} className="text-blue-400" /> Market News
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Real-time financial news powered by Finnhub</p>
        </div>
        <button onClick={() => fetchNews(category, stockSymbol || undefined)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#1a1d27] border border-[#2a2d3a] text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#2a2d3a] flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => handleCategory(c.key)}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors font-medium -mb-px
              ${category === c.key && !stockSymbol ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
            {c.label}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-3 flex-wrap pb-1">
          {TRENDING_SYMBOLS.map((sym) => (
            <button key={sym} onClick={() => handleStockNews(sym)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${stockSymbol === sym ? "bg-blue-600 border-blue-600 text-white" : "border-[#2a2d3a] text-gray-500 hover:text-white hover:border-gray-500"}`}>
              {sym}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
          <RefreshCw size={18} className="animate-spin" /> Loading news...
        </div>
      ) : news.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-600">No news found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main */}
          <div className="lg:col-span-2 space-y-3">
            {/* Featured */}
            {featured && (
              <a href={featured.url} target="_blank" rel="noopener noreferrer"
                className="block bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden hover:border-blue-500/40 transition-all group">
                {featured.image && (
                  <div className="relative h-48 overflow-hidden bg-[#0e0f14]">
                    <NewsImage src={featured.image} alt={featured.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d27] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} /> Top Story
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 text-xs font-medium">{featured.source}</span>
                    <span className="text-gray-600 text-xs flex items-center gap-1"><Clock size={10} />{timeAgo(featured.datetime)}</span>
                    {featured.related && <span className="text-green-400 text-xs font-medium flex items-center gap-1"><TrendingUp size={10} />{featured.related}</span>}
                  </div>
                  <h2 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-blue-300 transition-colors">{featured.headline}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2">{featured.summary}</p>
                </div>
              </a>
            )}

            {/* Rest */}
            {rest.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex gap-3 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 hover:border-blue-500/40 transition-all group">
                {item.image && (
                  <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#0e0f14]">
                    <NewsImage src={item.image} alt={item.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-blue-400 text-xs font-medium">{item.source}</span>
                    <span className="text-gray-600 text-xs flex items-center gap-1"><Clock size={10} />{timeAgo(item.datetime)}</span>
                    {item.related && <span className="text-green-400 text-xs font-medium">{item.related}</span>}
                  </div>
                  <h3 className="text-gray-200 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">{item.headline}</h3>
                </div>
                <ExternalLink size={14} className="text-gray-700 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
              </a>
            ))}

            {/* View More */}
            {visible < news.length && (
              <button onClick={() => setVisible(v => v + 6)}
                className="w-full py-3 rounded-xl border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-blue-500/40 hover:bg-[#1a1d27] text-sm transition-all">
                View More ({news.length - visible} remaining)
              </button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" /> Trending
              </h3>
              <div className="space-y-3">
                {trendingNews.map((item, i) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-2 group cursor-pointer">
                    <span className="text-gray-700 font-bold text-sm w-5 shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-gray-300 text-xs leading-snug line-clamp-2 group-hover:text-white transition-colors">{item.headline}</p>
                      <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1"><Clock size={9} />{timeAgo(item.datetime)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3">News by Stock</h3>
              <div className="grid grid-cols-3 gap-2">
                {TRENDING_SYMBOLS.map((sym) => (
                  <button key={sym} onClick={() => handleStockNews(sym)}
                    className={`text-xs py-2 rounded-lg border transition-colors font-medium
                      ${stockSymbol === sym ? "bg-blue-600 border-blue-600 text-white" : "border-[#2a2d3a] text-gray-400 hover:text-white hover:bg-[#2a2d3a]"}`}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
