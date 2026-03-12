import { NextResponse } from "next/server";
import { fetchEconomicNews } from "@/lib/news";
import { translateNewsToKorean, analyzeNewsForInsightsWithDebug } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * GET /api/insights/debug
 * AI 인사이트 파이프라인 단계별 디버깅
 * - 각 단계 성공/실패 확인
 * - 에러 메시지 및 raw 응답 일부 반환
 */
export async function GET() {
  const result: {
    step: string;
    status: "ok" | "warning" | "error";
    message?: string;
    data?: unknown;
  }[] = [];

  try {
    result.push({
      step: "1. API 키 확인",
      status: "ok",
      data: {
        GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
        GNEWS_API_KEY: !!(process.env.GNEWS_API_KEY || process.env.NEWS_API_KEY),
        GEMINI_MODEL_PRO: process.env.GEMINI_MODEL_PRO || "(기본값 사용)",
      },
    });
  } catch (e) {
    result.push({
      step: "1. API 키 확인",
      status: "error",
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ steps: result });
  }

  let newsText = "";

  try {
    const news = await fetchEconomicNews();
    const translatedNews = await translateNewsToKorean(news);
    newsText = translatedNews
      .map((n) => `${n.source}: ${n.translatedTitle ?? n.title}`)
      .join("\n");

    result.push({
      step: "2. 뉴스 수집 & 번역",
      status: "ok",
      data: {
        newsCount: translatedNews.length,
        newsTextLength: newsText.length,
        preview: newsText.slice(0, 200) + "...",
      },
    });
  } catch (e) {
    result.push({
      step: "2. 뉴스 수집 & 번역",
      status: "error",
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ steps: result });
  }

  try {
    const debugResult = await analyzeNewsForInsightsWithDebug(newsText);
    const { analysis, usedFallback, error, rawGeminiText } = debugResult;

    result.push({
      step: "3. AI 분석 (Gemini)",
      status: usedFallback ? "warning" : "ok",
      data: {
        sectorsCount: analysis.sectors?.length ?? 0,
        stocksCount: analysis.stocks?.length ?? 0,
        actionPlanCount: analysis.actionPlan?.length ?? 0,
        summary: analysis.summary ?? "(없음)",
        summaryLength: analysis.summary?.length ?? 0,
        usedFallback,
        message: usedFallback ? "⚠️ Fallback 사용됨 — 실제 AI 분석 실패. 아래 debug 확인" : "정상",
        ...(error && { error }),
        ...(rawGeminiText && { rawGeminiText }),
      },
    });

    return NextResponse.json({
      steps: result,
      fullAnalysis: analysis,
      debug: {
        usedFallback,
        error: error ?? null,
        rawGeminiText: rawGeminiText ?? null,
      },
    });
  } catch (e) {
    result.push({
      step: "3. AI 분석 (Gemini)",
      status: "error",
      message: e instanceof Error ? e.message : String(e),
      data:
        e instanceof Error && e.cause
          ? { cause: String(e.cause) }
          : undefined,
    });
    return NextResponse.json({ steps: result });
  }
}
