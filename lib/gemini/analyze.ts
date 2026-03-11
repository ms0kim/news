import { getGeminiModel } from "./client";
import type { Sector, Stock, ActionPlanItem } from "@/types";

export interface InsightAnalysis {
  sectors: Sector[];
  stocks: Stock[];
  actionPlan: ActionPlanItem[];
  summary?: string;
}

/**
 * 뉴스 기반 AI 투자 인사이트 분석
 * - 유망 섹터 3개
 * - 추천 종목 3~5개
 * - 투자 액션 플랜 4개 (초보자 눈높이)
 */
export async function analyzeNewsForInsights(
  newsText: string
): Promise<InsightAnalysis> {
  const model = getGeminiModel("pro");

  const prompt = `당신은 글로벌 경제 뉴스를 분석하여 투자 인사이트를 제공하는 전문가입니다.
아래 뉴스들을 분석하여, 다음 JSON 형식으로만 정확히 출력해 주세요. 다른 설명 없이 JSON만 출력하세요.

{
  "sectors": [
    { "name": "섹터명(한국어)", "change": "+X.X%", "icon": "이모지1개", "description": "한줄설명" }
  ],
  "stocks": [
    { "name": "종목명", "sector": "섹터", "symbol": "티커(선택)", "reason": "추천이유 한줄" }
  ],
  "actionPlan": [
    { "id": 1, "text": "액션플랜 항목(한국어, 초보자도 이해하기 쉬운 톤)", "priority": 1 }
  ],
  "summary": "오늘의 핵심 인사이트 2~3문장 요약"
}

규칙:
- sectors: 3개, 글로벌 트렌드에서 가장 유망한 섹터 (예: AI·반도체, 클린에너지, 헬스케어)
- stocks: 3~5개, 해당 섹터 관련 대표 종목 (한국·미국 주식 포함 가능)
- actionPlan: 4개, 투자자가 오늘 할 수 있는 구체적 액션 (예: "AI 반도체 ETF 비중 점검하기")
- 톤앤매너: 친근하고 초보자도 이해하기 쉬운 한국어
- change는 뉴스 기반 추정 또는 "+관심" 등으로 표시 가능

뉴스:
${newsText}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json" as const,
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;

  try {
    const parsed = JSON.parse(jsonStr) as InsightAnalysis;

    return {
      sectors: Array.isArray(parsed.sectors)
        ? parsed.sectors.slice(0, 3).map((s: Sector, i: number) => ({
            name: s.name ?? "미분류",
            change: s.change ?? "+관심",
            icon: s.icon ?? ["🤖", "⚡", "💊"][i] ?? "📈",
            description: s.description,
          }))
        : [],
      stocks: Array.isArray(parsed.stocks)
        ? parsed.stocks.slice(0, 5).map((s: Stock) => ({
            name: s.name ?? "미분류",
            sector: s.sector ?? "",
            symbol: s.symbol,
            reason: s.reason,
          }))
        : [],
      actionPlan: Array.isArray(parsed.actionPlan)
        ? parsed.actionPlan.slice(0, 4).map((a: ActionPlanItem, i: number) => ({
            id: a.id ?? i + 1,
            text: a.text ?? "",
            completed: false,
            priority: a.priority ?? i + 1,
          }))
        : [],
      summary: parsed.summary,
    };
  } catch {
    return getFallbackInsights();
  }
}

function getFallbackInsights(): InsightAnalysis {
  return {
    sectors: [
      { name: "AI & 반도체", change: "+관심", icon: "🤖", description: "AI 수요 확대" },
      { name: "클린에너지", change: "+관심", icon: "⚡", description: "에너지 전환" },
      { name: "헬스케어", change: "+관심", icon: "💊", description: "고령화 수혜" },
    ],
    stocks: [],
    actionPlan: [
      { id: 1, text: "오늘 주요 뉴스 확인하기", completed: false, priority: 1 },
      { id: 2, text: "포트폴리오 비중 점검하기", completed: false, priority: 2 },
      { id: 3, text: "관심 섹터 ETF 리서치하기", completed: false, priority: 3 },
      { id: 4, text: "리스크 관리 원칙 준수하기", completed: false, priority: 4 },
    ],
    summary: "뉴스 분석 중입니다. 잠시 후 다시 시도해 주세요.",
  };
}
