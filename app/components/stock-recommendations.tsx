"use client";

import { TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { useInsightsContext } from "./insights-provider";
import type { Stock } from "@/types";

export function StockRecommendations() {
  const { data, loading, error, refetch } = useInsightsContext();
  const stocks = data?.stocks ?? [];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-[#5BBD8C]" />
          <h3>추천 종목</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B7FD8] mb-3" />
          <p className="text-sm text-[#9B91C1]">종목 분석 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5BBD8C]" />
            <h3>추천 종목</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#8B7FD8] hover:bg-[#E5DFF8] transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
        <p className="text-sm text-[#9B91C1] py-4">{error}</p>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5BBD8C]" />
            <h3>추천 종목</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#8B7FD8] hover:bg-[#E5DFF8] transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
        <p className="text-sm text-[#9B91C1] py-4">
          오늘 분석된 추천 종목이 없습니다.
        </p>
      </div>
    );
  }

  const getStockUrl = (stock: Stock) => {
    if (!stock.symbol) return undefined;
    // 한국 주식: 6자리 숫자
    if (/^\d{6}$/.test(stock.symbol)) {
      return `https://finance.naver.com/item/main.naver?code=${stock.symbol}`;
    }
    // 미국 주식: 알파벳 티커 (Yahoo Finance)
    return `https://finance.yahoo.com/quote/${stock.symbol}`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-[#5BBD8C]" />
        <h3>추천 종목</h3>
      </div>

      <div className="space-y-3">
        {stocks.map((stock, i) => {
          const url = getStockUrl(stock);
          const content = (
            <div className="flex gap-3 p-4 rounded-2xl border border-[#E5DFF8] hover:bg-[#FBF9FF] transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#3D3557]">
                    {stock.name}
                  </span>
                  {stock.symbol && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5E8] text-[#5BBD8C]">
                      {stock.symbol}
                    </span>
                  )}
                </div>
                {stock.reason && (
                  <p className="text-xs text-[#9B91C1]">{stock.reason}</p>
                )}
              </div>
            </div>
          );

          return url ? (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {content}
            </a>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
