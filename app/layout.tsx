import type { Metadata } from "next";
import "../style/index.css";

export const metadata: Metadata = {
  title: "투자 뉴스 인사이트",
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
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUITE@2/fonts/static/woff2/SUITE.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
