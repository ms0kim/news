"use client";

import { CheckCircle2, Circle, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useInsightsContext } from "./insights-provider";
import type { ActionPlanItem } from "@/types";

const STORAGE_KEY = "actionPlanCompleted";

function getStoredCompleted(): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredCompleted(completed: Record<number, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

export function ActionPlan() {
  const { data, loading, error } = useInsightsContext();
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const actionPlan = data?.actionPlan ?? [];

  useEffect(() => {
    setCompleted(getStoredCompleted());
  }, []);

  const toggleAction = (id: number) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    setStoredCompleted(next);
  };

  const completedCount = actionPlan.filter((a) => completed[a.id]).length;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb className="w-5 h-5 text-[#FFD3A5]" />
          <h3>Today&apos;s Action Plan</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B7FD8] mb-3" />
          <p className="text-sm text-[#9B91C1]">액션 플랜 생성 중...</p>
        </div>
      </div>
    );
  }

  if (error || actionPlan.length === 0) {
    const fallbackPlan: ActionPlanItem[] = [
      { id: 1, text: "오늘 주요 뉴스 확인하기", completed: false },
      { id: 2, text: "포트폴리오 비중 점검하기", completed: false },
      { id: 3, text: "관심 섹터 ETF 리서치하기", completed: false },
      { id: 4, text: "리스크 관리 원칙 준수하기", completed: false },
    ];

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FFD3A5]" />
            <h3>Today&apos;s Action Plan</h3>
          </div>
          <div className="bg-[#FFF9E5] text-[#3D3557] px-3 py-1 rounded-full text-sm">
            {fallbackPlan.filter((a) => completed[a.id]).length}/{fallbackPlan.length}
          </div>
        </div>
        <div className="space-y-3">
          {fallbackPlan.map((action) => (
            <div
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                completed[action.id]
                  ? "bg-[#E8F5E8] border border-[#A8E6CF]"
                  : "bg-[#FBF9FF] border border-[#E5DFF8] hover:border-[#8B7FD8]"
              }`}
            >
              {completed[action.id] ? (
                <CheckCircle2 className="w-5 h-5 text-[#A8E6CF] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-[#9B91C1] flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm flex-1 ${
                  completed[action.id]
                    ? "text-[#3D3557] line-through opacity-60"
                    : "text-[#3D3557]"
                }`}
              >
                {action.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#FFD3A5]" />
          <h3>Today&apos;s Action Plan</h3>
        </div>
        <div className="bg-[#FFF9E5] text-[#3D3557] px-3 py-1 rounded-full text-sm">
          {completedCount}/{actionPlan.length}
        </div>
      </div>

      <div className="space-y-3">
        {actionPlan.map((action) => (
          <div
            key={action.id}
            onClick={() => toggleAction(action.id)}
            className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
              completed[action.id]
                ? "bg-[#E8F5E8] border border-[#A8E6CF]"
                : "bg-[#FBF9FF] border border-[#E5DFF8] hover:border-[#8B7FD8]"
            }`}
          >
            {completed[action.id] ? (
              <CheckCircle2 className="w-5 h-5 text-[#A8E6CF] flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-[#9B91C1] flex-shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm flex-1 ${
                completed[action.id]
                  ? "text-[#3D3557] line-through opacity-60"
                  : "text-[#3D3557]"
              }`}
            >
              {action.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
