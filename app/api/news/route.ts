import { NextResponse } from "next/server";
import { fetchEconomicNews } from "@/lib/news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/news
 * 국내 + 글로벌 경제 뉴스 반환
 */
export async function GET() {
  try {
    const news = await fetchEconomicNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error("[API /news]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "뉴스를 불러오는데 실패했습니다.", details: message },
      { status: 500 }
    );
  }
}
