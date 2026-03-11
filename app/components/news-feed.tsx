"use client";

import { Globe, Languages, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useInsightsContext } from "./insights-provider";

export function NewsFeed() {
  const { data, loading, error, refetch } = useInsightsContext();
  const [translateMode, setTranslateMode] = useState(false);

  const news = data?.news ?? [];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#8B7FD8]" />
            <h3>Market News</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B7FD8] mb-3" />
          <p className="text-sm text-[#9B91C1]">뉴스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#8B7FD8]" />
            <h3>Market News</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#8B7FD8] hover:bg-[#E5DFF8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">다시 시도</span>
          </button>
        </div>
        <p className="text-sm text-[#9B91C1] py-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#8B7FD8]" />
          <h3>Market News</h3>
        </div>
        <button
          onClick={() => setTranslateMode(!translateMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
            translateMode
              ? "bg-[#8B7FD8] text-white"
              : "bg-[#F5F3FF] text-[#8B7FD8]"
          }`}
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm">KR</span>
        </button>
      </div>

      <div className="space-y-3">
        {news.length === 0 ? (
          <p className="text-sm text-[#9B91C1] py-4">표시할 뉴스가 없습니다.</p>
        ) : (
          news.map((item) => (
            <a
              key={item.id}
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#E5DFF8] rounded-2xl p-4 hover:bg-[#FBF9FF] transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm mb-2 text-[#3D3557]">
                    {translateMode && item.translatedTitle
                      ? item.translatedTitle
                      : item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#9B91C1]">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.timeAgo ?? "-"}</span>
                  </div>
                </div>
                {item.isGlobal && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#FFB6C1] mt-2" />
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
