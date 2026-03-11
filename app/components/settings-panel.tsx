'use client'

import { Bell, Settings } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsPanel() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dailyNotifications");
    if (saved) {
      setNotificationsEnabled(JSON.parse(saved));
    }
  }, []);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("dailyNotifications", JSON.stringify(newValue));
    
    // In a real app, this would set up push notifications
    if (newValue) {
      console.log("Setting up 9:00 AM daily notifications");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Settings className="w-5 h-5 text-[#8B7FD8]" />
        <h3>Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#FBF9FF] rounded-2xl border border-[#E5DFF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E5DFF8] rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#8B7FD8]" />
            </div>
            <div>
              <div className="text-sm text-[#3D3557]">데일리 리마인더</div>
              <div className="text-xs text-[#9B91C1]">매일 오전 9시</div>
            </div>
          </div>
          
          <button
            onClick={toggleNotifications}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              notificationsEnabled ? "bg-[#8B7FD8]" : "bg-[#E5DFF8]"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notificationsEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#FFF9E5] to-[#FFE5EC] rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🌟</div>
          <div className="text-sm text-[#3D3557] mb-1">
            Keep learning every day!
          </div>
          <div className="text-xs text-[#9B91C1]">
            Small steps lead to big gains.
          </div>
        </div>
      </div>
    </div>
  );
}
