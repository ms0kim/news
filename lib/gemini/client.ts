import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

/** 번역 등 가벼운 작업용 (저렴, 빠름) */
export const MODEL_FLASH = "gemini-3.1-flash-lite-preview";

/** 주식 추천·인사이트 등 중요한 분석용 (고품질) - 2.5 Pro는 무료 0/0이라 Flash 사용 */
export const MODEL_PRO = "gemini-3-flash-preview";

export type GeminiModelType = "flash" | "pro";

/** Pro 모델 쿼터 소진 시 사용할 대체 모델 (env: GEMINI_MODEL_PRO_FALLBACK) */
export function getProFallbackModel(): GenerativeModel {
  const fallback =
    process.env.GEMINI_MODEL_PRO_FALLBACK?.trim() ||
    process.env.GEMINI_MODEL_FLASH?.trim() ||
    MODEL_FLASH;
  return getGeminiModelByName(fallback);
}

function getGeminiModelByName(modelName: string): GenerativeModel {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey?.trim();
  if (!apiKey || apiKey === "your-gemini-api-key") {
    throw new Error("GEMINI_API_KEY를 설정해 주세요. (로컬: .env.local, Vercel: 프로젝트 Settings → Environment Variables)");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

export function getGeminiModel(type: GeminiModelType = "flash") {
  const modelName =
    type === "pro"
      ? process.env.GEMINI_MODEL_PRO?.trim() || MODEL_PRO
      : process.env.GEMINI_MODEL_FLASH?.trim() || MODEL_FLASH;
  return getGeminiModelByName(modelName);
}

/** 쿼터 소진(429) 등으로 Pro 실패 시 true */
export function isQuotaOrModelError(e: unknown): boolean {
  const msg = String(e instanceof Error ? e.message : e).toLowerCase();
  const cause = e instanceof Error && e.cause ? String(e.cause).toLowerCase() : "";
  const combined = msg + " " + cause;
  return (
    combined.includes("429") ||
    combined.includes("resource_exhausted") ||
    combined.includes("resource exhausted") ||
    combined.includes("quota") ||
    combined.includes("rate limit") ||
    combined.includes("models/") // 모델 없음 등
  );
}
