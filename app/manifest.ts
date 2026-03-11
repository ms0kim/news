import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
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
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
