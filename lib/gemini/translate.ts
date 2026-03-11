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
