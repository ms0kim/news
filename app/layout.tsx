import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../style/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
