"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useInsights, type InsightsData } from "@/lib/hooks/useInsights";

const InsightsContext = createContext<{
  data: InsightsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} | null>(null);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const insights = useInsights();
  return (
    <InsightsContext.Provider value={insights}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsightsContext() {
  const ctx = useContext(InsightsContext);
  if (!ctx) {
    throw new Error("useInsightsContext must be used within InsightsProvider");
  }
  return ctx;
}
