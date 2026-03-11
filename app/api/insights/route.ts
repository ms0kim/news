import { NextResponse } from "next/server";
import { fetchEconomicNews } from "@/lib/news";
import {
  translateNewsToKorean,
  analyzeNewsForInsights,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/insights
 * 1. 뉴스 수집
 * 2. 영문 뉴스 한국어 번역
 * 3. AI 분석 (섹터, 종목, 액션플랜)
 */
export async function GET() {
  try {
    const news = await fetchEconomicNews();
    const translatedNews = await translateNewsToKorean(news);

    const newsText = translatedNews
      .map((n) => `${n.source}: ${n.translatedTitle ?? n.title}`)
      .join("\n");

    const analysis = await analyzeNewsForInsights(newsText);

    return NextResponse.json({
      news: translatedNews,
      sectors: analysis.sectors,
      stocks: analysis.stocks,
      actionPlan: analysis.actionPlan,
      summary: analysis.summary,
    });
  } catch (error) {
    console.error("[API /insights]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "인사이트를 생성하는데 실패했습니다.", details: message },
      { status: 500 }
    );
  }
}
