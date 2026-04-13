"use client";
import dynamic from "next/dynamic";

const ScreenerClient = dynamic(() => import("@/components/ScreenerClient"), { ssr: false });

export default function ScreenerPage() {
  return <ScreenerClient />;
}
