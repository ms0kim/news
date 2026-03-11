const GNEWS_BASE = "https://gnews.io/api/v4";

interface GNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string | null };
}

interface GNewsResponse {
  totalArticles?: number;
  articles: GNewsArticle[];
}

/**
 * GNews API 호출 (무료 100 req/day)
 * - 국내: lang=ko, country=kr, category=business
 * - 글로벌: lang=en, country=us, category=business
 */
export async function fetchGNews(params: {
  category?: string;
  lang?: string;
  country?: string;
  max?: number;
  q?: string;
  endpoint?: "top-headlines" | "search";
}): Promise<GNewsArticle[]> {
  const rawKey = process.env.GNEWS_API_KEY || process.env.NEWS_API_KEY;
  const apiKey = rawKey?.trim();
  if (!apiKey || apiKey === "your-gnews-api-key") {
    throw new Error("GNEWS_API_KEY를 .env.local에 설정해 주세요. (https://gnews.io/register)");
  }

  const endpoint = params.endpoint ?? "top-headlines";
  const url = new URL(`${GNEWS_BASE}/${endpoint}`);
  url.searchParams.set("apikey", apiKey);

  if (endpoint === "search") {
    url.searchParams.set("q", params.q ?? "economy");
  } else {
    url.searchParams.set("category", params.category ?? "business");
  }

  if (params.lang) url.searchParams.set("lang", params.lang);
  if (params.country) url.searchParams.set("country", params.country);
  url.searchParams.set("max", String(params.max ?? 15));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GNews API error: ${res.status} ${text}`);
  }

  const data: GNewsResponse = await res.json();
  return data.articles ?? [];
}
