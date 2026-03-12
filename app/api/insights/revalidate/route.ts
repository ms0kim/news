import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * POST /api/insights/revalidate
 * 인사이트 서버 캐시 무효화 (새로고침 시 최신 AI 분석 결과 반영)
 */
export async function POST() {
  try {
    revalidateTag("insights", "max");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[revalidate]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
