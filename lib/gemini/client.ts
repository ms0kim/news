import { GoogleGenerativeAI } from "@google/generative-ai";

/** 번역 등 가벼운 작업용 (저렴, 빠름) */
export const MODEL_FLASH = "gemini-3.1-flash-lite-preview";

/** 주식 추천·인사이트 등 중요한 분석용 (고품질) - 2.5 Pro는 무료 0/0이라 Flash 사용 */
export const MODEL_PRO = "gemini-3-flash-preview";

export type GeminiModelType = "flash" | "pro";

export function getGeminiModel(type: GeminiModelType = "flash") {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey?.trim();
  if (!apiKey || apiKey === "your-gemini-api-key") {
    throw new Error("GEMINI_API_KEY를 설정해 주세요. (로컬: .env.local, Vercel: 프로젝트 Settings → Environment Variables)");
  }
  const modelName =
    type === "pro"
      ? process.env.GEMINI_MODEL_PRO?.trim() || MODEL_PRO
      : process.env.GEMINI_MODEL_FLASH?.trim() || MODEL_FLASH;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}
