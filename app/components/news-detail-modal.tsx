"use client";

import { X, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import type { NewsItem } from "@/types";

interface NewsDetailModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  const [translated, setTranslated] = useState<{
    translatedTitle: string;
    translatedContent: string;
    summary: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;

    setTranslated(null);
    setLoading(true);

    // 모든 뉴스에 대해 번역/요약 API 호출 (요약은 항상 표시)
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
        if (!data.error) {
          setTranslated({
            translatedTitle: data.translatedTitle ?? item.title,
            translatedContent: data.translatedContent ?? item.content ?? "",
            summary: data.summary ?? "",
          });
        } else {
          setTranslated({
            translatedTitle: item.translatedTitle ?? item.title,
            translatedContent: item.content ?? "",
            summary: "요약을 생성할 수 없습니다.",
          });
        }
      })
      .catch(() => {
        setTranslated({
          translatedTitle: item.translatedTitle ?? item.title,
          translatedContent: item.content ?? "",
          summary: "요약을 불러올 수 없습니다.",
        });
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
          <span className="text-xs text-[#9B91C1]">{item.source}</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5F3FF] transition-colors"
          >
            <X className="w-5 h-5 text-[#3D3557]" />
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
            <div className="text-xs font-medium text-[#8B7FD8] mb-2">
              📌 요약
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
              className="flex items-center gap-2 text-sm text-[#8B7FD8] hover:underline"
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
