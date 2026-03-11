import { getGeminiModel } from "./client";
import type { NewsItem } from "@/types";

/**
 * 영문 뉴스 제목을 한국어로 자연스럽게 번역
 */
export async function translateNewsToKorean(
  newsItems: NewsItem[]
): Promise<NewsItem[]> {
  const toTranslate = newsItems.filter((n) => n.isGlobal && !n.translatedTitle);
  if (toTranslate.length === 0) return newsItems;

  const model = getGeminiModel("flash");
  const titles = toTranslate.map((n) => n.title).join("\n");

  const prompt = `다음 영문 경제 뉴스 제목들을 자연스러운 한국어로 번역해 주세요.
각 줄을 한 줄씩 번역만 출력하고, 번호나 기호 없이 제목만 출력하세요.
원문 순서를 유지하세요.

뉴스 제목들:
${titles}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const translatedLines = text
    .trim()
    .split("\n")
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  const translatedMap = new Map<string, string>();
  toTranslate.forEach((item, i) => {
    translatedMap.set(item.id, translatedLines[i] ?? item.title);
  });

  return newsItems.map((item) => {
    const translated = translatedMap.get(item.id);
    if (translated) {
      return { ...item, translatedTitle: translated };
    }
    return item;
  });
}

/**
 * 뉴스 제목·본문을 번역(영문인 경우)하고 2~3문장 요약
 * - 영문: 한국어 번역 + 요약
 * - 한국어: 그대로 + 요약
 */
export async function translateAndSummarizeNews(
  title: string,
  content: string,
  options?: { isKorean?: boolean }
): Promise<{ translatedTitle: string; translatedContent: string; summary: string }> {
  const model = getGeminiModel("flash");
  const text = content || title;
  const isKorean = options?.isKorean ?? false;

  if (!text.trim()) {
    return {
      translatedTitle: title,
      translatedContent: "",
      summary: "요약할 내용이 없습니다.",
    };
  }

  const prompt = isKorean
    ? `다음 한국어 경제 뉴스 제목과 본문을 2~3문장으로 요약해 주세요.
JSON 형식으로만 출력하세요. 다른 설명 없이 JSON만 출력하세요.

{
  "translatedTitle": "원문 제목 그대로",
  "translatedContent": "원문 본문 그대로",
  "summary": "2~3문장 요약"
}

제목: ${title}
본문: ${text.slice(0, 3000)}`
    : `다음 영문 경제 뉴스 제목과 본문을 한국어로 번역하고, 2~3문장으로 요약해 주세요.
JSON 형식으로만 출력하세요. 다른 설명 없이 JSON만 출력하세요.

{
  "translatedTitle": "한국어 제목",
  "translatedContent": "한국어로 번역된 본문 전체",
  "summary": "2~3문장 요약"
}

제목: ${title}
본문: ${text.slice(0, 3000)}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json" as const,
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const response = result.response;
  const raw = response.text();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return {
    translatedTitle: parsed.translatedTitle ?? title,
    translatedContent: parsed.translatedContent ?? (isKorean ? text : ""),
    summary: parsed.summary ?? "요약을 생성할 수 없습니다.",
  };
}
