import { NextResponse } from "next/server";

/**
 * GET /api/health
 * API 키 설정 상태 확인 (키 값은 노출하지 않음)
 */
export async function GET() {
  const gnewsKey = process.env.GNEWS_API_KEY || process.env.NEWS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const status = {
    GNEWS_API_KEY: {
      set: !!gnewsKey,
      length: gnewsKey?.length ?? 0,
      hasSpaces: gnewsKey?.includes(" ") ?? false,
      trimmed: gnewsKey?.trim().length === gnewsKey?.length,
    },
    GEMINI_API_KEY: {
      set: !!geminiKey,
      length: geminiKey?.length ?? 0,
      hasSpaces: geminiKey?.includes(" ") ?? false,
      trimmed: geminiKey?.trim().length === geminiKey?.length,
    },
  };

  return NextResponse.json(status);
}
