import { NextRequest, NextResponse } from "next/server";

const EMOJIS = ["🐰", "🍧", "🩰", "🍦", "🍨", "🐶", "🐹", "🩰", "🧴"];

function getDefaultEmoji() {
  return EMOJIS[new Date().getDate() % EMOJIS.length];
}

export async function GET(request: NextRequest) {
  const emoji = request.nextUrl.searchParams.get("e") || getDefaultEmoji();

  const manifest = {
    name: "투자 뉴스 인사이트",
    short_name: "투자뉴스",
    description: "AI가 분석한 경제 뉴스와 투자 인사이트",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B7FD8",
    orientation: "portrait",
    icons: [
      {
        src: `/api/icon/192?e=${encodeURIComponent(emoji)}`,
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `/api/icon/512?e=${encodeURIComponent(emoji)}`,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `/api/icon/192?e=${encodeURIComponent(emoji)}`,
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: `/api/icon/512?e=${encodeURIComponent(emoji)}`,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
