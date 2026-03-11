import { toNewsItem } from "./utils";
import { fetchGNews } from "./gnews";
import type { NewsItem } from "@/types";

/**
 * 국내 + 글로벌 경제 뉴스 수집
 * - 국내: 한국어 비즈니스 뉴스 (GNews ko/kr)
 * - 글로벌: 영문 비즈니스 뉴스 (GNews en/us)
 * 번역은 Step 3에서 Gemini로 처리
 */
export async function fetchEconomicNews(): Promise<NewsItem[]> {
  const [koreanArticles, globalArticles] = await Promise.all([
    fetchGNews({
      category: "business",
      lang: "ko",
      country: "kr",
      max: 8,
    }),
    fetchGNews({
      category: "business",
      lang: "en",
      country: "us",
      max: 10,
    }),
  ]);

  const items: NewsItem[] = [];
  let id = 1;

  for (const article of koreanArticles) {
    items.push(
      toNewsItem(article, { isGlobal: false, id: `kr-${id++}` })
    );
  }

  for (const article of globalArticles) {
    items.push(
      toNewsItem(article, { isGlobal: true, id: `global-${id++}` })
    );
  }

  // publishedAt 기준 최신순 정렬
  items.sort((a, b) => {
    const dateA = new Date(a.publishedAt ?? 0).getTime();
    const dateB = new Date(b.publishedAt ?? 0).getTime();
    return dateB - dateA;
  });

  return items.slice(0, 15);
}
