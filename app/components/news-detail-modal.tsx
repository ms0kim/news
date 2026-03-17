"use client";

import { X, Loader2, ExternalLink, Coffee } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { NewsItem } from "@/types";

const CACHE_KEY = "news-translation-cache";

type TranslationCache = {
  translatedTitle: string;
  translatedContent: string;
  summary: string;
};

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

// 뉴스 아이템의 캐시 키 생성 (id + 내용 해시)
function getCacheKey(item: NewsItem): string {
  const contentHash = simpleHash(item.title + (item.content || ""));
  return `${item.id}_${contentHash}`;
}

function getStoredCache(): Record<string, TranslationCache> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(cache: Record<string, TranslationCache>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or disabled
  }
}

interface NewsDetailModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  const [translated, setTranslated] = useState<TranslationCache | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, TranslationCache>>(getStoredCache());

  useEffect(() => {
    if (item) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;

    const cacheKey = getCacheKey(item);

    // 메모리에 없으면 localStorage에서 로드 (새로고침 후 복원)
    let cached = cacheRef.current[cacheKey];
    if (!cached && typeof window !== "undefined") {
      cached = getStoredCache()[cacheKey];
      if (cached) cacheRef.current[cacheKey] = cached;
    }
    if (cached) {
      setTranslated(cached);
      setLoading(false);
      return;
    }

    setTranslated(null);
    setLoading(true);

    fetch("/api/news/translate-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        content: item.content || item.title,
        isKorean: !item.isGlobal,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        let result: TranslationCache;
        if (!data.error) {
          result = {
            translatedTitle: data.translatedTitle ?? item.title,
            translatedContent: data.translatedContent ?? item.content ?? "",
            summary: data.summary ?? "",
          };
        } else {
          result = {
            translatedTitle: item.translatedTitle ?? item.title,
            translatedContent: item.content ?? "",
            summary: "요약을 생성할 수 없습니다.",
          };
        }
        cacheRef.current[cacheKey] = result;
        saveToStorage(cacheRef.current);
        setTranslated(result);
      })
      .catch(() => {
        const result: TranslationCache = {
          translatedTitle: item.translatedTitle ?? item.title,
          translatedContent: item.content ?? "",
          summary: "요약을 불러올 수 없습니다.",
        };
        cacheRef.current[cacheKey] = result;
        saveToStorage(cacheRef.current);
        setTranslated(result);
      })
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;

  const displayTitle = translated?.translatedTitle ?? item.translatedTitle ?? item.title;
  const displayContent = translated?.translatedContent ?? item.content;
  const summary = translated?.summary;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E5DFF8]">
          <span className="text-sm p-1 text-[#9B91C1]">{item.source}</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F3FF] transition-colors"
          >
            <X className="w-5 h-5 text-[#8B7FD8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-base font-medium text-[#3D3557]">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                번역 중...
              </span>
            ) : (
              displayTitle
            )}
          </h3>

          <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E5DFF8]">
            <div className="flex items-start gap-1.5 text-xs font-medium text-[#8B7FD8] mb-2">
              <Coffee className="w-3.5 h-3.5 mt-0.4" /> 요약
            </div>
            <p className="text-sm text-[#3D3557]">
              {loading ? "요약 생성 중..." : summary || "요약을 불러오는 중..."}
            </p>
          </div>

          {displayContent && (
            <div className="text-sm text-[#3D3557] leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </div>
          )}

          {!displayContent && !loading && (
            <p className="text-sm text-[#9B91C1]">
              본문이 없습니다. 원문 링크에서 확인해 주세요.
            </p>
          )}

          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#8B7FD8] hover:underline w-fit"
            >
              <ExternalLink className="w-4 h-4" />
              원문 보기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
