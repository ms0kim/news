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

export function useInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.details || err.error || "Failed to fetch";
        throw new Error(msg);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { data, loading, error, refetch: fetchInsights };
}
