# Step 2: 뉴스 API 연동

## 구현 내용

### 1. GNews API 연동
- **lib/news/gnews.ts**: GNews API 호출
- 국내: `lang=ko`, `country=kr`, `category=business`
- 글로벌: `lang=en`, `country=us`, `category=business`

### 2. 데이터 정제
- **lib/news/utils.ts**: `getTimeAgo()`, `toNewsItem()`
- ISO 날짜 → "2시간 전" 형식
- 원시 응답 → `NewsItem` 타입 변환

### 3. API 라우트
- **GET /api/news**: 국내 + 글로벌 뉴스 병합 후 최신순 15건 반환

## 환경 변수

```env
GNEWS_API_KEY=your-gnews-api-key
```

또는 `NEWS_API_KEY` 사용 가능 (동일 키로 GNews 호출)

## GNews API 키 발급

1. https://gnews.io/register
2. 회원가입 후 Dashboard에서 API Key 복사
3. `.env.local`에 `GNEWS_API_KEY` 추가

## 테스트

```bash
# 개발 서버 실행
npm run dev

# 다른 터미널에서
curl http://localhost:3000/api/news
```

## 다음 단계 (Step 3)

- Gemini API로 해외 뉴스 한국어 번역
- AI 기반 섹터/종목 분석
