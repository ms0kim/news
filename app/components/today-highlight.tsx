"use client";

import { Sparkle, Loader2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useInsightsContext } from "./insights-provider";
import { StockDetailModal } from "./stock-detail-modal";
import type { Stock } from "@/types";

const DEFAULT_STOCKS: Stock[] = [
  { name: "삼성전자", sector: "반도체", symbol: "005930", reason: "국내 대표 반도체·전자 기업", change: "+관심", icon: "🌟" },
  { name: "SK하이닉스", sector: "반도체", symbol: "000660", reason: "메모리 반도체 글로벌 1위", change: "+관심", icon: "🧩" },
  { name: "엔비디아", sector: "AI", symbol: "NVDA", reason: "AI GPU 시장 선점 기업", change: "+관심", icon: "🎯" },
];

const STOCK_ICON_MAP: Record<string, string> = {
  // 한국 반도체·전자
  삼성전자: "🌟",
  "SK하이닉스": "🧩",
  "LG화학": "⚗️",
  삼성바이오로직스: "🧬",
  "LG에너지솔루션": "🔋",
  // 미국 테크
  엔비디아: "🎯",
  NVIDIA: "🎯",
  테슬라: "⚡",
  Tesla: "⚡",
  애플: "🍎",
  Apple: "🍎",
  마이크로소프트: "🪟",
  Microsoft: "🪟",
  구글: "🌐",
  Google: "🌐",
  AMD: "🔧",
  아마존: "📦",
  Amazon: "📦",
  메타: "👥",
  Meta: "👥",
  네이버: "🟢",
  카카오: "💬",
  현대차: "🚙",
  기아: "🏎️",
  포스코: "🏭",
  셀트리온: "💉",
  "KB금융": "🏦",
  "삼성전자우": "🌟",
};

const SECTOR_ICON_POOL: Record<string, string[]> = {
  반도체: ["🌟", "🧩", "🎯", "🔬", "💎"],
  AI: ["🎯", "🤖", "🧠", "⚡"],
  전기차: ["⚡", "🚗", "🔋", "🌱"],
  테크: ["🍎", "🪟", "🌐", "📱", "💻"],
  헬스케어: ["💉", "🧬", "💊", "🏥"],
  금융: ["🏦", "💰", "📊"],
  에너지: ["⚡", "🔋", "☀️"],
  화학: ["⚗️", "🌿", "🧪"],
};

function getStockIcon(stock: Stock): string {
  const direct = stock.icon ?? STOCK_ICON_MAP[stock.name];
  if (direct) return direct;
  const sector = stock.sector ?? "";
  const pool = SECTOR_ICON_POOL[sector] ?? ["📈", "📊", "💹", "🎯", "⭐"];
  const idx = (stock.name?.length ?? 0) % pool.length;
  return pool[idx];
}

export function TodayHighlight() {
  const { data, loading, error, refetch } = useInsightsContext();
  const stocks = (data?.stocks?.length ? data.stocks : DEFAULT_STOCKS).slice(0, 5);
  const summary = data?.summary;

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockQuotes, setStockQuotes] = useState<Record<string, string>>({});

  const stockSymbols = stocks.filter((s) => s.symbol).map((s) => s.symbol!);
  useEffect(() => {
    if (!stockSymbols.length) return;
    stockSymbols.forEach((symbol) => {
      const market = /^\d{6}$/.test(symbol) ? "kr" : "us";
      fetch(`/api/stock/quote?symbol=${symbol}&market=${market}`)
        .then((res) => res.json())
        .then((d) => {
          if (!d.error && d.changeStr) {
            setStockQuotes((prev) => ({ ...prev, [symbol]: d.changeStr }));
          }
        })
        .catch(() => {});
    });
  }, [stockSymbols.join(",")]);

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5" />
            <h2 className="text-white">Today's AI Picks</h2>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/30 text-white hover:bg-white/40 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
        <p className="text-sm opacity-90">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-[#8B7FD8] to-[#C4B5FD] rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkle className="w-5 h-5" />
          <h2 className="text-white">Today's AI Picks</h2>
        </div>

        {summary && (
          <p className="text-sm opacity-90 mb-4 leading-relaxed">{summary}</p>
        )}

        <div className="space-y-3">
          {stocks.map((stock, i) => {
            const change = stockQuotes[stock.symbol ?? ""] ?? stock.change ?? "+관심";
            const positive = change.startsWith("+") && !change.includes("관심");
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedStock(stock)}
                className="w-full text-left bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-2xl shrink-0">{getStockIcon(stock)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stock.name}</span>
                      {stock.symbol && (
                        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-white/20">
                          {stock.symbol}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#F5F3FF] rounded-full px-3 py-1">
                  {positive ? (
                    <TrendingUp className="w-4 h-4 text-[#5BBD8C]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#FF8FAB]" />
                  )}
                  <span className="text-sm font-semibold text-[#8B7FD8]">{change}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
      />
    </>
  );
}
