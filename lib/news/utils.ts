import type { NewsItem } from "@/types";

/**
 * ISO 날짜를 "2h ago", "3d ago" 형식으로 변환
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

/**
 * GNews/NewsAPI 원시 응답을 NewsItem으로 정제
 */
export function toNewsItem(
  article: {
    title: string;
    description?: string | null;
    content?: string | null;
    url?: string | null;
    publishedAt?: string | null;
    source?: { name?: string } | null;
  },
  options: { isGlobal: boolean; id: string }
): NewsItem {
  const source = article.source?.name ?? "Unknown";
  const publishedAt = article.publishedAt ?? new Date().toISOString();

  return {
    id: options.id,
    title: article.title?.trim() || "(제목 없음)",
    content: article.description || article.content || undefined,
    source,
    sourceUrl: article.url || undefined,
    isGlobal: options.isGlobal,
    publishedAt,
    timeAgo: getTimeAgo(publishedAt),
  };
}
