import { NextResponse } from "next/server";

/**
 * Vercel Cron Job - 매일 오전 9시(KST) 실행
 * schedule: "0 0 * * *" = 매일 00:00 UTC = 09:00 KST
 *
 * CRON_SECRET 환경 변수 설정 시 자동 검증 (Vercel이 Authorization: Bearer {CRON_SECRET} 전송)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  console.log(`[Cron] Daily job executed at ${now}`);

  return NextResponse.json({
    success: true,
    message: "Daily cron job completed",
    timestamp: now,
  });
}
