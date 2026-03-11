"use client";

import { X, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Stock } from "@/types";

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
}

function getKoreanStockUrl(symbol: string): string {
  return `https://finance.naver.com/item/main.naver?code=${symbol}`;
}

function getUsStockUrl(symbol: string): string {
  return `https://www.google.com/finance/quote/${symbol}:NASDAQ?hl=ko`;
}

const STOCK_ICON_MAP: Record<string, string> = {
  삼성전자: "🌟",
  "SK하이닉스": "🧩",
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
  네이버: "🟢",
  "LG화학": "⚗️",
  AMD: "🔧",
  아마존: "📦",
  Amazon: "📦",
  메타: "👥",
  Meta: "👥",
  카카오: "💬",
  현대차: "🚙",
  기아: "🏎️",
  포스코: "🏭",
  셀트리온: "💉",
  "KB금융": "🏦",
  삼성바이오로직스: "🧬",
  "LG에너지솔루션": "🔋",
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

function getStockIcon(stock: { name?: string; sector?: string; icon?: string }): string {
  const direct = stock.icon ?? STOCK_ICON_MAP[stock.name ?? ""];
  if (direct) return direct;
  const sector = stock.sector ?? "";
  const pool = SECTOR_ICON_POOL[sector] ?? ["📈", "📊", "💹", "🎯", "⭐"];
  const idx = (stock.name?.length ?? 0) % pool.length;
  return pool[idx];
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  const [quote, setQuote] = useState<{
    changeStr: string;
    price: number;
    currency: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stock?.symbol) return;

    setLoading(true);
    const market = /^\d{6}$/.test(stock.symbol) ? "kr" : "us";
    fetch(`/api/stock/quote?symbol=${stock.symbol}&market=${market}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setQuote({
            changeStr: data.changeStr,
            price: data.price,
            currency: data.currency,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stock]);

  if (!stock) return null;

  const isKorean = /^\d{6}$/.test(stock.symbol ?? "");
  const detailUrl = isKorean
    ? getKoreanStockUrl(stock.symbol!)
    : getUsStockUrl(stock.symbol!);

  const formatPrice = (p: number, currency: string) => {
    if (currency === "KRW") return `${p.toLocaleString()}원`;
    return `$${p.toLocaleString()}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E5DFF8]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getStockIcon(stock)}</span>
            <div>
              <h3 className="text-lg font-semibold text-[#3D3557]">
                {stock.name}
              </h3>
              {stock.symbol && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#8B7FD8]">
                  {stock.symbol}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F3FF] transition-colors"
          >
            <X className="w-5 h-5 text-[#3D3557]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#8B7FD8]" />
              <span className="text-sm text-[#9B91C1]">등락률 조회 중...</span>
            </div>
          ) : quote ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#3D3557]">
                {formatPrice(quote.price, quote.currency)}
              </span>
              <span
                className={`text-lg font-medium ${
                  quote.changeStr.startsWith("+")
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {quote.changeStr}
              </span>
            </div>
          ) : null}

          {stock.reason && (
            <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E5DFF8]">
              <div className="text-xs font-medium text-[#8B7FD8] mb-2">
                📌 부가설명
              </div>
              <p className="text-sm text-[#3D3557]">{stock.reason}</p>
            </div>
          )}

          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#8B7FD8] text-white hover:bg-[#7A6FC7] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {isKorean ? "네이버 금융에서 보기" : "Google 금융에서 보기 (한국어)"}
          </a>
        </div>
      </div>
    </div>
  );
}
