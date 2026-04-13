import type { Metadata } from "next";
import "./globals.css";
import MarketOverview from "@/components/MarketOverview";
import Watchlist from "@/components/Watchlist";
import LayoutClient from "@/components/LayoutClient";

export const metadata: Metadata = {
  title: "TradeView - Stock Dashboard",
  description: "Real-time stock market dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col overflow-hidden">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
