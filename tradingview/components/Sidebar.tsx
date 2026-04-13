"use client";
import { LayoutDashboard, TrendingUp, Star, Briefcase, Clock, ScanSearch, Newspaper, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: TrendingUp, label: "Markets", href: "/" },
  { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
  { icon: ScanSearch, label: "Screener", href: "/screener" },
  { icon: Newspaper, label: "News", href: "/news" },
  { icon: BrainCircuit, label: "AI Analysis", href: "/ai" },
  { icon: Star, label: "Watchlist", href: "/" },
  { icon: Clock, label: "History", href: "/" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-14 hover:w-44 group transition-all duration-200 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col py-3 overflow-hidden">
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href && href !== "/" || (href === "/" && label === "Dashboard" && pathname === "/");
        return (
          <Link key={label} href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors whitespace-nowrap
              ${active ? "text-white bg-[#2a2d3a] border-r-2 border-blue-500" : "text-gray-500 hover:text-gray-300 hover:bg-[#22253a]"}`}>
            <Icon size={18} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
