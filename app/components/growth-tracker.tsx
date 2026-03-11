"use client";

import { Calendar, Award, Flame } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "growthTrackerActivity";

function getDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getStoredActivity(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function setStoredActivity(activity: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activity));
}

function calculateStreak(activity: Record<string, boolean>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    if (activity[key]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function GrowthTracker() {
  const [activity, setActivity] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = getStoredActivity();
    const todayKey = getDateKey(new Date());

    // 오늘 방문 기록
    const updated = { ...stored, [todayKey]: true };
    setActivity(updated);
    setStoredActivity(updated);
  }, []);

  const streak = calculateStreak(activity);
  const activeDays = Object.values(activity).filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-[#8B7FD8]" />
        <h3>성장 트래커</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#FFE5EC] to-[#FFB6C1] rounded-2xl p-4 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-[#FF8FAB]" />
          <div className="text-2xl font-semibold text-[#3D3557]">{streak}</div>
          <div className="text-xs text-[#3D3557] opacity-70">일 연속</div>
        </div>

        <div className="bg-gradient-to-br from-[#E8F5E8] to-[#A8E6CF] rounded-2xl p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-[#5BBD8C]" />
          <div className="text-2xl font-semibold text-[#3D3557]">
            {activeDays}
          </div>
          <div className="text-xs text-[#3D3557] opacity-70">활동 일수</div>
        </div>
      </div>
    </div>
  );
}
