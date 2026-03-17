import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/stock/quote?symbol=005930&market=kr
 * Yahoo Finance Chart API로 실시간 등락률 조회 (무료, 인증 불필요)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const market = searchParams.get("market") || "kr";

    if (!symbol) {
      return NextResponse.json({ error: "symbol 필요" }, { status: 400 });
    }

    // 한국: 005930.KS, 미국: NVDA
    const yahooSymbol = market === "kr" && /^\d{6}$/.test(symbol)
      ? `${symbol}.KS`
      : symbol;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    const result = data?.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: "종목 정보 없음" }, { status: 404 });
    }

    const price = result.meta?.regularMarketPrice ?? 0;
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    // null이 아닌 유효한 종가만 필터링
    const validCloses = closes.filter((c: number | null): c is number => c !== null && !isNaN(c));
    // 유효한 종가 중 마지막 2개를 비교 (오늘 종가, 어제 종가)
    const prevClose = validCloses.length >= 2
      ? validCloses[validCloses.length - 2]
      : result.meta?.chartPreviousClose ?? result.meta?.previousClose ?? 0;
    const change = prevClose && price ? ((price - prevClose) / prevClose) * 100 : 0;
    const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;

    return NextResponse.json({
      symbol,
      price,
      prevClose,
      change,
      changeStr,
      currency: result.meta?.currency ?? "USD",
    });
  } catch (error) {
    console.error("[API /stock/quote]", error);
    return NextResponse.json(
      { error: "주가 조회 실패" },
      { status: 500 }
    );
  }
}
