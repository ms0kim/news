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
          <h3>오늘 확인해야 할 리스트</h3>
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
      { id: 1, text: "오늘 경제 뉴스 한 줄씩 읽어보기", completed: false },
      { id: 2, text: "내가 산 주식이 얼마인지 확인해보기", completed: false },
      { id: 3, text: "관심 분야(AI·전기차 등) 정보 찾아보기", completed: false },
      { id: 4, text: "모르는 종목은 사지 않고, 아는 것만 적당히 투자하기", completed: false },
    ];

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FFD3A5]" />
            <h3>오늘 확인해야 할 리스트</h3>
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
                  ? "bg-[#F5F3FF] border border-[#E5DFF8]"
                  : "bg-[#FBF9FF] border border-[#E5DFF8] hover:border-[#8B7FD8]"
              }`}
            >
              {completed[action.id] ? (
                <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-[#9B91C1] flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm flex-1 ${
                  completed[action.id]
                    ? "text-[#9B91C1] line-through"
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
          <h3>오늘 확인해야 할 리스트</h3>
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
                ? "bg-[#F5F3FF] border border-[#E5DFF8]"
                : "bg-[#FBF9FF] border border-[#E5DFF8] hover:border-[#8B7FD8]"
            }`}
          >
            {completed[action.id] ? (
              <CheckCircle2 className="w-5 h-5 text-[#8B7FD8] flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-[#9B91C1] flex-shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm flex-1 ${
                completed[action.id]
                  ? "text-[#9B91C1] line-through"
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
