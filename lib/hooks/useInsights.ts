"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  NewsItem,
  Sector,
  Stock,
  ActionPlanItem,
} from "@/types";

export interface InsightsData {
  news: NewsItem[];
  sectors: Sector[];
  stocks: Stock[];
  actionPlan: ActionPlanItem[];
  summary?: string;
}

const CACHE_KEY = "insights_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

// 모달 캐시 키들 (데이터 갱신 시 함께 클리어)
const MODAL_CACHE_KEYS = [
  "news-translation-cache",
  "news-investment-advice-cache",
];

function getCached(): { data: InsightsData; timestamp: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return { data, timestamp };
  } catch {
    return null;
  }
}

function setCached(data: InsightsData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
}

function clearCached() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
    // 관련 모달 캐시들도 함께 클리어 (데이터 동기화)
    MODAL_CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {}
}

export function useInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCached();
      if (cached) {
        setData(cached.data);
        setLoading(false);
        // 백그라운드에서 새로고침 (캐시 갱신)
        fetch("/api/insights")
          .then((res) => res.ok && res.json())
          .then((json) => {
            if (json && !json.error) {
              setData(json);
              setCached(json);
            }
          })
          .catch(() => {});
        return;
      }
    }

    setLoading(true);
    setError(null);
    clearCached();
    try {
      if (forceRefresh) {
        await fetch("/api/insights/revalidate", { method: "POST" });
      }
      const res = await fetch("/api/insights", {
        cache: forceRefresh ? "no-store" : "default",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.details || err.error || "Failed to fetch";
        throw new Error(msg);
      }
      const json = await res.json();
      setData(json);
      setCached(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchInsights(true),
  };
}
