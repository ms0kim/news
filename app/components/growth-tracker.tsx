'use client'

import { Calendar, Award, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function GrowthTracker() {
  const [streak, setStreak] = useState(0);
  const [activityData, setActivityData] = useState<boolean[]>([]);

  useEffect(() => {
    // Load from localStorage or initialize
    const savedStreak = localStorage.getItem("investmentStreak");
    const savedActivity = localStorage.getItem("activityData");
    const lastVisit = localStorage.getItem("lastVisit");
    
    const today = new Date().toDateString();
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    
    if (savedActivity) {
      setActivityData(JSON.parse(savedActivity));
    } else {
      // Initialize 42 days (6 weeks)
      setActivityData(new Array(42).fill(false).map((_, i) => i % 3 === 0));
    }

    // Check if it's a new day and increment streak
    if (lastVisit !== today) {
      const newStreak = lastVisit ? streak + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem("investmentStreak", newStreak.toString());
      localStorage.setItem("lastVisit", today);
      
      // Mark today as active
      const newActivity = [...activityData];
      newActivity[newActivity.length - 1] = true;
      setActivityData(newActivity);
      localStorage.setItem("activityData", JSON.stringify(newActivity));
    }
  }, []);

  const weeks = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(activityData.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-[#8B7FD8]" />
        <h3>Growth Tracker</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#FFE5EC] to-[#FFB6C1] rounded-2xl p-4 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-[#FF8FAB]" />
          <div className="text-2xl font-semibold text-[#3D3557]">{streak}</div>
          <div className="text-xs text-[#3D3557] opacity-70">Day Streak</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#E8F5E8] to-[#A8E6CF] rounded-2xl p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-[#5BBD8C]" />
          <div className="text-2xl font-semibold text-[#3D3557]">
            {activityData.filter((d) => d).length}
          </div>
          <div className="text-xs text-[#3D3557] opacity-70">Active Days</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-[#9B91C1] mb-2">Last 6 weeks</div>
        <div className="flex gap-1.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1.5">
              {week.map((active, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-5 h-5 rounded ${
                    active
                      ? "bg-[#8B7FD8]"
                      : "bg-[#F5F3FF] border border-[#E5DFF8]"
                  }`}
                  title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
