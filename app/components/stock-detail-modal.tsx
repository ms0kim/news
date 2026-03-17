"use client";

import { createPortal } from "react-dom";
import { X, ExternalLink, Loader2, PiggyBank, Clock, HandCoins, Wallet } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Stock } from "@/types";

type InvestmentAdvice = {
  buyPrice: string;
  sellPrice: string;
  buyTiming: string;
  sellTiming: string;
  strategy: string;
};

const ADVICE_CACHE_KEY = "news-investment-advice-cache";

// 데이터 변경 감지를 위한 간단한 해시 생성
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// 주식의 캐시 키 생성 (symbol + 이유/섹터 해시)
function getAdviceCacheKey(stock: Stock): string {
  const contentHash = simpleHash(stock.name + (stock.reason || "") + (stock.sector || ""));
  return `${stock.symbol}_${contentHash}`;
}

function getStoredAdviceCache(): Record<string, InvestmentAdvice> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ADVICE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAdviceToStorage(cache: Record<string, InvestmentAdvice>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADVICE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

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

function getKrwFromUsdText(text: string, rate: number): string | null {
  if (!text.includes("$")) return null;
  const numbers =
    text.match(/[\d,]+(?:\.\d+)?/g)?.map((m) => parseFloat(m.replace(/,/g, ""))) ?? [];
  if (numbers.length === 0) return null;
  const krwNums = numbers.map((n) => Math.round(n * rate));
  return krwNums.length > 1
    ? `약 ${krwNums[0].toLocaleString()}~${krwNums[1].toLocaleString()}원`
    : `약 ${krwNums[0].toLocaleString()}원`;
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  const [quote, setQuote] = useState<{
    changeStr: string;
    price: number;
    currency: string;
  } | null>(null);
  const [usdKrwRate, setUsdKrwRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<InvestmentAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const adviceCacheRef = useRef<Record<string, InvestmentAdvice>>({});

  useEffect(() => {
    if (stock) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [stock]);

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

  useEffect(() => {
    if (quote?.currency === "USD") {
      fetch("/api/exchange-rate?from=USD&to=KRW")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error && data.rate) setUsdKrwRate(data.rate);
        })
        .catch(() => {});
    } else {
      setUsdKrwRate(null);
    }
  }, [quote?.currency]);

  // 투자 조언: quote 로드 후 API 호출 또는 캐시에서
  useEffect(() => {
    if (!stock?.symbol) return;

    const cacheKey = getAdviceCacheKey(stock);
    let cached = adviceCacheRef.current[cacheKey];
    if (!cached && typeof window !== "undefined") {
      cached = getStoredAdviceCache()[cacheKey];
      if (cached) adviceCacheRef.current[cacheKey] = cached;
    }
    if (cached) {
      setAdvice(cached);
      setAdviceLoading(false);
      return;
    }

    if (!quote?.price) {
      setAdvice(null);
      return;
    }

    setAdviceLoading(true);
    setAdvice(null);

    fetch("/api/stock/investment-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: stock.name,
        symbol: stock.symbol,
        currentPrice: quote.price,
        currency: quote.currency,
        reason: stock.reason,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const result: InvestmentAdvice = {
            buyPrice: data.buyPrice ?? "-",
            sellPrice: data.sellPrice ?? "-",
            buyTiming: data.buyTiming ?? "-",
            sellTiming: data.sellTiming ?? "-",
            strategy: data.strategy ?? "-",
          };
          adviceCacheRef.current[cacheKey] = result;
          saveAdviceToStorage({ ...getStoredAdviceCache(), [cacheKey]: result });
          setAdvice(result);
        }
      })
      .catch(() => setAdvice(null))
      .finally(() => setAdviceLoading(false));
  }, [stock, quote?.price, quote?.currency]);

  if (!stock) return null;

  const isKorean = /^\d{6}$/.test(stock.symbol ?? "");
  const detailUrl = isKorean
    ? getKoreanStockUrl(stock.symbol!)
    : getUsStockUrl(stock.symbol!);

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5DFF8] bg-gradient-to-r from-[#FBF9FF] to-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-sm">{getStockIcon(stock)}</span>
            <div>
              <h3 className="text-lg font-semibold text-[#3D3557]">
                {stock.name}
              </h3>
              {stock.symbol && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#8B7FD8] font-medium">
                  {stock.symbol}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F3FF] transition-colors text-[#8B7FD8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="w-5 h-5 animate-spin text-[#8B7FD8]" />
              <span className="text-sm text-[#9B91C1]">등락률 조회 중...</span>
            </div>
          ) : quote ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              {quote.currency === "KRW" ? (
                <span className="text-2xl font-bold text-[#3D3557]">
                  {quote.price.toLocaleString()}원
                </span>
              ) : (
                <>
                  <span className="text-2xl font-bold text-[#3D3557]">
                    ${quote.price.toLocaleString()}
                  </span>
                  {usdKrwRate && (
                    <span className="text-sm text-[#9B91C1] font-normal">
                      (약 {Math.round(quote.price * usdKrwRate).toLocaleString()}원)
                    </span>
                  )}
                </>
              )}
              <span
                className={`text-base font-semibold px-2 py-0.5 rounded-lg ${
                  quote.changeStr.startsWith("+")
                    ? "text-[#FF8FAB] bg-[#FFE5EC]/70"
                    : "text-[#5BBD8C] bg-[#E8F5E8]/70"
                }`}
              >
                {quote.changeStr}
              </span>
            </div>
          ) : null}

          {stock.reason && (
            <p className="text-sm text-[#6B6378] leading-relaxed">{stock.reason}</p>
          )}

          {/* AI 투자 조언 */}
          <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E5DFF8]">
            <div className="text-xs font-semibold text-[#8B7FD8] mb-3 flex items-center gap-1.5">
              AI 투자 조언
            </div>
            {adviceLoading ? (
              <div className="flex items-center gap-2 py-6">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B7FD8]" />
                <span className="text-sm text-[#9B91C1]">투자 전략 분석 중...</span>
              </div>
            ) : advice ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-2.5 p-3 rounded-md bg-white/60">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <PiggyBank className="w-4 h-4 text-[#8B7FD8] shrink-0" />
                    <span className="text-xs text-[#9B91C1]">권장 매수가</span>
                  </div>
                  <div className="text-[13px] text-[#3D3557] break-words leading-snug">
                    {quote?.currency === "USD" && usdKrwRate ? (
                      (() => {
                        const t = advice.buyPrice ?? "-";
                        const krw = getKrwFromUsdText(t, usdKrwRate);
                        return krw ? (
                          <>
                            {t}{" "}
                            <span className="text-[11px] text-[#9B91C1]">({krw})</span>
                          </>
                        ) : (
                          t
                        );
                      })()
                    ) : (
                      advice.buyPrice ?? "-"
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 p-3 rounded-md bg-white/60">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <HandCoins className="w-4 h-4 text-[#8B7FD8] shrink-0" />
                    <span className="text-xs text-[#9B91C1]">권장 매도가</span>
                  </div>
                  <div className="text-[13px] text-[#3D3557] break-words leading-snug">
                    {quote?.currency === "USD" && usdKrwRate ? (
                      (() => {
                        const t = advice.sellPrice ?? "-";
                        const krw = getKrwFromUsdText(t, usdKrwRate);
                        return krw ? (
                          <>
                            {t}{" "}
                            <span className="text-[11px] text-[#9B91C1]">({krw})</span>
                          </>
                        ) : (
                          t
                        );
                      })()
                    ) : (
                      advice.sellPrice ?? "-"
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-2.5 p-3 rounded-md bg-white/60">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#8B7FD8] shrink-0" />
                    <span className="text-xs text-[#9B91C1]">매수 타이밍</span>
                  </div>
                  <div className="text-[13px] text-[#3D3557] break-words leading-snug">{advice.buyTiming ?? "-"}</div>
                </div>
                <div className="flex flex-col gap-2.5 p-3 rounded-md bg-white/60">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#8B7FD8] shrink-0" />
                    <span className="text-xs text-[#9B91C1]">매도 타이밍</span>
                  </div>
                  <div className="text-[13px] text-[#3D3557] break-words leading-snug">{advice.sellTiming ?? "-"}</div>
                </div>
              </div>
              {advice.strategy && (
                <div className="pt-3 border-t border-[#E5DFF8]">
                  <div className="text-xs font-medium text-[#8B7FD8] mb-1.5">투자 전략</div>
                  <p className="text-[#3D3557] text-[13px] leading-relaxed">{advice.strategy}</p>
                </div>
              )}
              <p className="text-[11px] text-[#9B91C1]/90">
                ※ AI 참고용이며, 투자 결정은 본인 판단으로 하세요.
              </p>
            </div>
            ) : quote ? (
              <p className="text-sm text-[#9B91C1]">투자 조언을 불러올 수 없습니다.</p>
            ) : null}
          </div>

          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#8B7FD8] text-white font-medium hover:bg-[#7A6FC7] transition-colors shadow-sm hover:shadow"
          >
            <ExternalLink className="w-4 h-4" />
            {isKorean ? "네이버 금융에서 보기" : "Google 금융에서 보기 (한국어)"}
          </a>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
