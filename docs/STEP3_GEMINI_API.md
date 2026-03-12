# Step 3: Google Gemini API 연동

## 구현 내용

### 1. Gemini 클라이언트
- **lib/gemini/client.ts**: `gemini-1.5-flash` 모델 (무료 티어)

### 2. 영문 뉴스 번역
- **lib/gemini/translate.ts**: `translateNewsToKorean()`
- 글로벌 뉴스(isGlobal) 제목만 한국어로 번역

### 3. AI 투자 인사이트 분석
- **lib/gemini/analyze.ts**: `analyzeNewsForInsights()`
- JSON 형식으로 응답: sectors, stocks, actionPlan, summary
- 파싱 실패 시 fallback 데이터 반환

### 4. API 라우트
- **GET /api/insights**:
  1. 뉴스 수집
  2. 영문 → 한국어 번역
  3. AI 분석 (섹터, 종목, 액션플랜)
  4. 통합 응답 반환

## 환경 변수

```env
GEMINI_API_KEY=your-gemini-api-key

# Pro 모델 쿼터 소진 시 사용할 대체 모델 (선택)
# GEMINI_MODEL_PRO_FALLBACK=gemini-3.1-flash-lite-preview
# GEMINI_MODEL_PRO=gemini-3-flash-preview
# GEMINI_MODEL_FLASH=gemini-3.1-flash-lite-preview
```

## 발급 방법

1. https://aistudio.google.com/app/apikey
2. Google 계정 로그인
3. API 키 생성 후 복사

## 응답 형식

```json
{
  "news": [...],
  "sectors": [
    { "name": "AI & 반도체", "change": "+8.4%", "icon": "🤖", "description": "..." }
  ],
  "stocks": [
    { "name": "엔비디아", "sector": "AI", "symbol": "NVDA", "reason": "..." }
  ],
  "actionPlan": [
    { "id": 1, "text": "AI 반도체 ETF 비중 점검하기", "completed": false }
  ],
  "summary": "오늘의 핵심 인사이트..."
}
```

## 다음 단계 (Step 4)

- UI 컴포넌트에 `/api/insights` 데이터 바인딩
