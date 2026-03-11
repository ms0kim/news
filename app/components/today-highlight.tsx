"use client";

import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useInsightsContext } from "./insights-provider";
import type { Sector } from "@/types";

const FALLBACK_SECTORS: Sector[] = [
  { name: "AI & 반도체", change: "+관심", icon: "🤖" },
  { name: "클린에너지", change: "+관심", icon: "⚡" },
  { name: "헬스케어", change: "+관심", icon: "💊" },
];

export function TodayHighlight() {
  const { data, loading, error } = useInsightsContext();
  const sectors = data?.sectors?.length ? data.sectors : FALLBACK_SECTORS;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#8B7FD8] to-[#C4B5FD] rounded-3xl p-6 text-white shadow-lg min-h-[180px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-90" />
        <p className="text-sm opacity-90">AI가 분석 중이에요...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#8B7FD8] to-[#C4B5FD] rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-white">Today&apos;s AI Picks</h2>
        </div>
        <p className="text-sm opacity-90">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#8B7FD8] to-[#C4B5FD] rounded-3xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-white">Today&apos;s AI Picks</h2>
      </div>

      <div className="space-y-3">
        {sectors.map((sector, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{sector.icon}</div>
              <div>
                <div className="text-sm opacity-90">{sector.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/30 rounded-full px-3 py-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{sector.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
