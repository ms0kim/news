import { getGeminiModel, getProFallbackModel, isQuotaOrModelError } from "./client";

export interface InvestmentAdvice {
  buyPrice: string;       // 권장 매수가 (예: "68,000~70,000원", "$120~125")
  sellPrice: string;      // 권장 매도가 (예: "75,000원 이상", "$140 목표")
  buyTiming: string;      // 매수 타이밍 (예: "조정 시", "지지선 근처")
  sellTiming: string;     // 매도 타이밍 (예: "목표가 도달 시", "손절선 이탈 시")
  strategy: string;       // 투자 전략 요약 (2~3문장)
}

export async function getInvestmentAdvice(params: {
  name: string;
  symbol: string;
  currentPrice: number;
  currency: string;
  reason?: string;
}): Promise<InvestmentAdvice> {
  const { name, symbol, currentPrice, currency, reason } = params;
  const priceStr = currency === "KRW"
    ? `${currentPrice.toLocaleString()}원`
    : `$${currentPrice.toLocaleString()}`;

  const prompt = `당신은 주식 투자 조언 전문가입니다. 아래 종목에 대한 구체적인 투자 조언을 JSON 형식으로만 출력하세요.

종목: ${name} (${symbol})
현재가: ${priceStr}
추천 이유: ${reason || "시장 관심 종목"}

다음 JSON 형식으로만 출력 (다른 설명 없이):
{
  "buyPrice": "권장 매수가 (현재가 기준 구체적 가격대, 예: 68,000~70,000원 또는 $120~125)",
  "sellPrice": "권장 매도가/목표가 (예: 75,000원 이상 또는 $140 목표)",
  "buyTiming": "매수 타이밍 (예: 3~5% 조정 시, 지지선 근처에서)",
  "sellTiming": "매도 타이밍 (예: 목표가 도달 시, 손절선 -5% 이탈 시)",
  "strategy": "투자 전략 2~3문장. 언제 사고 언제 팔지, 리스크 관리 방법을 구체적으로."
}

규칙:
- buyPrice, sellPrice: 현재가를 참고하여 현실적인 가격대 제시
- 한국주식은 원화(예: 68,000원), 미국주식은 달러(예: $120)
- strategy: 초보자도 이해할 수 있는 쉬운 표현
- JSON만 출력, 문자열 내 쌍따옴표 이스케이프`;

  const genConfig = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json" as const,
      temperature: 0.5,
      maxOutputTokens: 1024,
    },
  };

  let text: string;
  try {
    const model = getGeminiModel("pro");
    text = (await model.generateContent(genConfig)).response.text();
  } catch (e) {
    if (isQuotaOrModelError(e)) {
      const fallbackModel = getProFallbackModel();
      text = (await fallbackModel.generateContent(genConfig)).response.text();
      console.log("[getInvestmentAdvice] Pro 쿼터 소진, 대체 모델로 성공");
    } else {
      throw e;
    }
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];

  const parsed = JSON.parse(text) as InvestmentAdvice;
  return {
    buyPrice: parsed.buyPrice ?? "-",
    sellPrice: parsed.sellPrice ?? "-",
    buyTiming: parsed.buyTiming ?? "-",
    sellTiming: parsed.sellTiming ?? "-",
    strategy: parsed.strategy ?? "-",
  };
}
