import { NextResponse } from "next/server";
import { translateAndSummarizeNews } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/news/translate-summary
 * 영문 뉴스 제목+본문을 한국어로 번역하고 요약
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title = "", content = "", isKorean = false } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: "제목 또는 본문이 필요합니다." },
        { status: 400 }
      );
    }

    const result = await translateAndSummarizeNews(
      String(title),
      String(content),
      { isKorean: Boolean(isKorean) }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /news/translate-summary]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "번역/요약에 실패했습니다.", details: message },
      { status: 500 }
    );
  }
}
