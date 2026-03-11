"use client";

import { Download } from "lucide-react";
import { useState, useEffect } from "react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<{ outcome: string }>;
  } | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 이미 앱으로 설치되어 있으면 표시 안 함
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (isStandalone) return;

    const stored = localStorage.getItem("pwaInstallDismissed");
    if (stored) setDismissed(true);

    // Service worker 등록 (PWA 설치 조건 충족)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => Promise<{ outcome: string }> });
      if (!stored) setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwaInstallDismissed", "true");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwaInstallDismissed", "true");
  };

  if (!showPrompt || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl bg-[#8B7FD8] p-4 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium">앱으로 설치하기</div>
            <div className="text-xs opacity-90">홈 화면에 추가해서 사용해 보세요</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-full px-3 py-1.5 text-xs opacity-90 hover:bg-white/20"
          >
            나중에
          </button>
          <button
            onClick={handleInstall}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#8B7FD8]"
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}
