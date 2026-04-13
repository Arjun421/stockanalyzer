"use client";
import dynamic from "next/dynamic";

const NewsClient = dynamic(() => import("@/components/NewsClient"), { ssr: false });

export default function NewsPage() {
  return <NewsClient />;
}
