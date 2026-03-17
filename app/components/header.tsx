"use client";

import { useState, useEffect } from "react";
import { useEmoji } from "@/lib/emoji-context";
import { useHeaderText, DEFAULT_BOTTOM_SUB, getDefaultGreeting } from "@/lib/header-text-context";

export function Header() {
  const emoji = useEmoji();
  const { headerText, bottomSubText } = useHeaderText();

  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDate(
        new Date().toLocaleDateString("ko-KR", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
      setGreeting(headerText.trim() || getDefaultGreeting());
    };

    updateDateTime();

    // visibility change 시 업데이트 (모바일에서 앱 다시 열 때)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateDateTime();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [headerText]);

  const displayBottomSub = bottomSubText.trim() || DEFAULT_BOTTOM_SUB;

  return (
    <div className="bg-background px-6 pt-10 pb-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-muted-foreground text-sm" suppressHydrationWarning>
              {currentDate}
            </p>
            <h1 className="text-foreground text-2xl font-medium mt-1" suppressHydrationWarning>
              {greeting}
            </h1>
          </div>
          <div className="text-5xl">{emoji}</div>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          {displayBottomSub}
        </p>
      </div>
    </div>
  );
}
  