/**
 * 앱 전역 타입 정의 (DB 미사용, API 응답 및 UI용)
 */

export interface Sector {
  name: string;
  change: string;
  icon: string;
  description?: string;
}

export interface Stock {
  name: string;
  sector: string;
  symbol?: string;
  reason?: string;
}

export interface ActionPlanItem {
  id: number;
  text: string;
  completed?: boolean;
  priority?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content?: string;
  source: string;
  sourceUrl?: string;
  isGlobal: boolean;
  translatedTitle?: string;
  translatedContent?: string;
  publishedAt?: string;
  timeAgo?: string;
}
