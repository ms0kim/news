import type { Metadata } from "next";
import "../style/index.css";
import { EmojiProvider } from "@/lib/emoji-context";

export const metadata: Metadata = {
  title: "Song News",
  description: "AI가 분석한 경제 뉴스와 투자 인사이트",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "투자뉴스",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="icon"
          href="/api/icon/128?e=%F0%9F%90%B0&bg=0"
          type="image/svg+xml"
          sizes="128x128"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUITE@2/fonts/static/woff2/SUITE.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <EmojiProvider>{children}</EmojiProvider>
      </body>
    </html>
  );
}
