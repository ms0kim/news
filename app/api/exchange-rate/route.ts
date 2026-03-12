import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/exchange-rate?from=USD&to=KRW
 * Frankfurter API로 환율 조회 (무료, API 키 불필요)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to") || "KRW";

    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    const rate = data?.rates?.[to];
    if (rate == null) {
      return NextResponse.json({ error: "환율 조회 실패" }, { status: 404 });
    }

    return NextResponse.json({ rate, from, to });
  } catch (error) {
    console.error("[API /exchange-rate]", error);
    return NextResponse.json(
      { error: "환율 조회 실패" },
      { status: 500 }
    );
  }
}
