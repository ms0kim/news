import { NextResponse } from "next/server";
import { getInvestmentAdvice } from "@/lib/gemini/investment-advice";

export const dynamic = "force-dynamic";

/**
 * POST /api/stock/investment-advice
 * 종목별 AI 투자 조언 (매수/매도 가격, 타이밍, 전략)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, symbol, currentPrice, currency = "USD", reason } = body;

    if (!name || !symbol || currentPrice == null) {
      return NextResponse.json(
        { error: "name, symbol, currentPrice 필요" },
        { status: 400 }
      );
    }

    const advice = await getInvestmentAdvice({
      name: String(name),
      symbol: String(symbol),
      currentPrice: Number(currentPrice),
      currency: String(currency),
      reason: reason ? String(reason) : undefined,
    });

    return NextResponse.json(advice);
  } catch (error) {
    console.error("[API /stock/investment-advice]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "투자 조언 생성 실패", details: message },
      { status: 500 }
    );
  }
}
