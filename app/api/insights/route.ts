import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchEconomicNews } from "@/lib/news";
import {
  translateNewsToKorean,
  analyzeNewsForInsights,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

const CACHE_SECONDS = 60 * 60; // 1시간

async function fetchInsightsData() {
  const news = await fetchEconomicNews();
  const translatedNews = await translateNewsToKorean(news);

  const newsText = translatedNews
    .map((n) => `${n.source}: ${n.translatedTitle ?? n.title}`)
    .join("\n");

  const analysis = await analyzeNewsForInsights(newsText);

  return {
    news: translatedNews,
    sectors: analysis.sectors,
    stocks: analysis.stocks,
    actionPlan: analysis.actionPlan,
    summary: analysis.summary,
  };
}

/**
 * GET /api/insights
 * 1. 뉴스 수집 2. 번역 3. AI 분석
 * 캐시: 1시간 (같은 날짜 내 재요청 시 캐시 사용)
 */
export async function GET() {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);

    const getCached = unstable_cache(
      fetchInsightsData,
      ["insights", dateKey],
      { revalidate: CACHE_SECONDS }
    );

    const data = await getCached();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
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
