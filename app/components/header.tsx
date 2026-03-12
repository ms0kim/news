"use client";

import { useEmoji } from "@/lib/emoji-context";

export function Header() {
  const emoji = useEmoji();

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 18) return "좋은 오후에요";
    return "좋은 저녁이에요";
  };

  return (
    <div className="bg-background px-6 pt-10 pb-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-muted-foreground text-sm">{currentDate}</p>
            <h1 className="text-foreground text-2xl font-medium mt-1">{getGreeting()}</h1>
          </div>
          <div className="text-5xl">{emoji}</div>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          Let&apos;s grow your wealth together today
        </p>
      </div>
    </div>
  );
}
  