import JSON5 from "json5";
import { getGeminiModel } from "./client";
import type { Sector, Stock, ActionPlanItem } from "@/types";

export interface InsightAnalysis {
  sectors: Sector[];
  stocks: Stock[];
  actionPlan: ActionPlanItem[];
  summary?: string;
}

export interface InsightAnalysisDebug {
  analysis: InsightAnalysis;
  usedFallback: boolean;
  error?: string;
  rawGeminiText?: string;
}

const PROMPT_TEMPLATE = `당신은 글로벌 경제 뉴스를 분석하여 투자 인사이트를 제공하는 전문가입니다.
아래 뉴스들을 분석하여, 다음 JSON 형식으로만 정확히 출력해 주세요. 다른 설명 없이 JSON만 출력하세요.

{
  "sectors": [
    { "name": "섹터명(한국어)", "change": "+X.X%", "icon": "이모지1개", "description": "한줄설명" }
  ],
  "stocks": [
    { "name": "종목명", "sector": "섹터", "symbol": "티커", "reason": "추천이유", "change": "+X.X%", "icon": "이모지1개" }
  ],
  "actionPlan": [
    { "id": 1, "text": "액션플랜 항목(한국어)", "priority": 1 }
  ],
  "summary": "뉴스 기반 오늘의 시장 분석 요약 (50자 내외)"
}

규칙:
- sectors: 3개, 글로벌 트렌드에서 가장 유망한 섹터
- stocks: 반드시 3~5개. symbol은 필수. 실제 상장 종목만.
  * 한국: symbol 6자리 (005930, 000660, 051910, 035420, 006400)
  * 미국: symbol 티커 (NVDA, TSLA, AAPL, MSFT, GOOGL, AMD)
  * change: 뉴스 기반 추정 등락률 (예: "+2.1%", "-0.5%", "+관심")
  * icon: 해당 종목에 어울리는 이모지 1개. 종목마다 서로 다른 이모지 사용.
  예: 삼성전자🌟, SK하이닉스🧩, 엔비디아🎯, 테슬라⚡, 애플🍎, 구글🌐, 네이버🟢, 마이크로소프트🪟, AMD🔧, 아마존📦, 현대차🚙, 포스코🏭, 셀트리온💉 등
  * reason: 부가설명 한 줄 (예: "AI 반도체 수요 확대로 실적 기대")
- actionPlan: 4개. 반드시 투자 초보자가 이해하기 쉬운 표현으로 작성.
  * 전문 용어(포트폴리오, 비중, 리스크, ETF, 리서치 등) 대신 쉬운 말 사용
  * 예: "오늘 경제 뉴스 한 줄씩 읽어보기", "내가 산 주식이 얼마인지 확인해보기", "관심 분야(AI·전기차 등) 정보 찾아보기", "모르는 종목은 사지 않고 아는 것만 적당히 투자하기"
- summary: 필수. 50자 내외로 뉴스 내용을 디테일하게 분석·요약. 핵심 트렌드, 섹터 동향, 시장 이슈를 구체적으로 담을 것.
  * 예: "AI 반도체·전기차 수요 확대, 금리 우려에 방어적 섹터 주목", "엔고·원유 하락에 수출주·항공주 기대감, 반도체 실적 주시"
- change: "+관심" 또는 "+X.X%"
- JSON 문법: 문자열 안에 쌍따옴표(") 사용 금지. reason/description/summary는 한 줄로, 이스케이프 필요 문자 없이 작성.

뉴스:
`;

/**
 * 디버그용: fallback 사용 여부, 에러, raw 응답 포함
 */
export async function analyzeNewsForInsightsWithDebug(
  newsText: string
): Promise<InsightAnalysisDebug> {
  const model = getGeminiModel("pro");
  const prompt = PROMPT_TEMPLATE + (newsText || "경제·시장 동향");

  let text: string;
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json" as const,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });
    const response = result.response;
    text = response.text();
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const msg = err.message + (err.cause ? ` (cause: ${err.cause})` : "");
    console.error("[analyzeNewsForInsights] Gemini API error:", msg);
    return {
      analysis: getFallbackInsights(),
      usedFallback: true,
      error: msg,
      rawGeminiText: undefined,
    };
  }

  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
  const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonStr = braceMatch[0];

  // LLM이 자주 출력하는 잘못된 JSON 수정
  jsonStr = jsonStr
    .replace(/,(\s*[}\]])/g, "$1") // trailing comma 제거
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ""); // 제어문자 제거 (줄바꿈·탭 제외)

  const parseJson = (str: string): InsightAnalysis => {
    try {
      return JSON.parse(str) as InsightAnalysis;
    } catch {
      return JSON5.parse(str) as InsightAnalysis;
    }
  };

  try {
    const parsed = parseJson(jsonStr);

    const stocks = Array.isArray(parsed.stocks)
      ? parsed.stocks
          .slice(0, 5)
          .map((s: Stock & { symbol?: string; change?: string; icon?: string }) => ({
            name: s.name ?? "미분류",
            sector: s.sector ?? "",
            symbol: s.symbol ?? inferSymbol(s.name),
            reason: s.reason,
            change: s.change ?? "+관심",
            icon: s.icon ?? "📈",
          }))
          .filter((s) => s.name && s.symbol)
      : [];

    const raw = parsed as unknown as Record<string, unknown>;
    const rawSummary = raw.summary ?? raw.Summary ?? raw.요약;
    let summary =
      typeof rawSummary === "string" && rawSummary.trim()
        ? rawSummary.trim()
        : undefined;

    if (!summary && Array.isArray(parsed.sectors) && parsed.sectors.length > 0) {
      const first = parsed.sectors[0] as { name?: string; description?: string };
      summary = first.description ?? `${first.name} 관심`;
    }

    const analysis: InsightAnalysis = {
      sectors: Array.isArray(parsed.sectors)
        ? parsed.sectors.slice(0, 3).map((s: Sector, i: number) => ({
            name: s.name ?? "미분류",
            change: s.change ?? "+관심",
            icon: s.icon ?? ["🤖", "⚡", "💊"][i] ?? "📈",
            description: s.description,
          }))
        : [],
      stocks: stocks.length > 0 ? stocks : getDefaultStocks(),
      actionPlan: Array.isArray(parsed.actionPlan)
        ? parsed.actionPlan.slice(0, 4).map((a: ActionPlanItem, i: number) => ({
            id: a.id ?? i + 1,
            text: a.text ?? "",
            completed: false,
            priority: a.priority ?? i + 1,
          }))
        : [],
      summary: summary || "오늘의 AI 추천 종목을 확인해보세요",
    };
    return { analysis, usedFallback: false };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[analyzeNewsForInsights] JSON parse error:", err.message);
    console.error("[analyzeNewsForInsights] Raw text:", text?.slice(0, 500));
    return {
      analysis: getFallbackInsights(),
      usedFallback: true,
      error: `JSON 파싱 실패: ${err.message}`,
      rawGeminiText: text?.slice(0, 800),
    };
  }
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
  const { analysis } = await analyzeNewsForInsightsWithDebug(newsText);
  return analysis;
}

const SYMBOL_MAP: Record<string, string> = {
  삼성전자: "005930",
  "SK하이닉스": "000660",
  "LG화학": "051910",
  네이버: "035420",
  삼성바이오로직스: "207940",
  엔비디아: "NVDA",
  NVIDIA: "NVDA",
  테슬라: "TSLA",
  Tesla: "TSLA",
  애플: "AAPL",
  Apple: "AAPL",
  마이크로소프트: "MSFT",
  Microsoft: "MSFT",
  구글: "GOOGL",
  Google: "GOOGL",
  AMD: "AMD",
};

function inferSymbol(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return SYMBOL_MAP[trimmed] ?? "";
}

function getDefaultStocks(): Stock[] {
  return [
    { name: "삼성전자", sector: "반도체", symbol: "005930", reason: "국내 대표 반도체·전자 기업", change: "+관심", icon: "🌟" },
    { name: "SK하이닉스", sector: "반도체", symbol: "000660", reason: "메모리 반도체 글로벌 1위", change: "+관심", icon: "🧩" },
    { name: "엔비디아", sector: "AI·반도체", symbol: "NVDA", reason: "AI GPU 시장 선점 기업", change: "+관심", icon: "🎯" },
    { name: "테슬라", sector: "전기차", symbol: "TSLA", reason: "EV·에너지 트렌드", change: "+관심", icon: "⚡" },
    { name: "애플", sector: "테크", symbol: "AAPL", reason: "글로벌 테크 대표주", change: "+관심", icon: "🍎" },
  ];
}

function getFallbackInsights(): InsightAnalysis {
  return {
    sectors: [
      { name: "AI & 반도체", change: "+관심", icon: "🤖", description: "AI 수요 확대" },
      { name: "클린에너지", change: "+관심", icon: "⚡", description: "에너지 전환" },
      { name: "헬스케어", change: "+관심", icon: "💊", description: "고령화 수혜" },
    ],
    stocks: getDefaultStocks(),
    actionPlan: [
      { id: 1, text: "오늘 경제 뉴스 한 줄씩 읽어보기", completed: false, priority: 1 },
      { id: 2, text: "내가 산 주식이 얼마인지 확인해보기", completed: false, priority: 2 },
      { id: 3, text: "관심 분야(AI·전기차 등) 정보 찾아보기", completed: false, priority: 3 },
      { id: 4, text: "모르는 종목은 사지 않고, 아는 것만 적당히 투자하기", completed: false, priority: 4 },
    ],
    summary: undefined,
  };
}
