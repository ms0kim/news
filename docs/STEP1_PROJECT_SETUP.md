# Step 1: 프로젝트 설정 및 환경 변수

## 📁 프로젝트 폴더 구조

```
news/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── news/               # 뉴스 조회 (Step 2)
│   │   ├── insights/           # Gemini 분석 결과 (Step 3)
│   │   └── cron/                # Vercel Cron (Step 5)
│   │       └── send-notification/
│   ├── components/
│   │   ├── header.tsx
│   │   ├── today-highlight.tsx
│   │   ├── news-feed.tsx
│   │   ├── action-plan.tsx
│   │   ├── growth-tracker.tsx
│   │   └── settings-panel.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── news/                   # 뉴스 API 유틸 (Step 2)
│   ├── gemini/                 # Gemini API 유틸 (Step 3)
│   └── aligo/                  # 알리고 API 유틸 (Step 5)
├── types/
│   └── index.ts                # Sector, Stock, NewsItem 등
├── style/
├── public/
└── docs/
```

---

## 🔑 환경 변수 (.env.local)

| 변수명 | 용도 | 발급처 |
|--------|------|--------|
| `NEWS_API_KEY` | 뉴스 API 호출 | [NewsAPI.org](https://newsapi.org/register) 또는 [GNews](https://gnews.io/) |
| `GEMINI_API_KEY` | Gemini 번역/분석 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `ALIGO_API_KEY` | 알림톡 발송 | [알리고](https://www.aligo.in/) |
| `ALIGO_USER_ID` | 알리고 사용자 ID | 알리고 |
| `ALIGO_SENDER` | 발신번호 | 알리고 |

---

## ⚙️ 설정 방법

### 1. 환경 변수 파일 생성

```bash
cp .env.example .env.local
```

### 2. 각 API 키 발급

1. **NewsAPI.org** (무료 100 req/day)
   - https://newsapi.org/register
   - 회원가입 후 API Key 발급

2. **GNews** (대안, 무료 100 req/day)
   - https://gnews.io/
   - API Key 발급

3. **Google Gemini** (무료 티어)
   - https://aistudio.google.com/app/apikey
   - Google 계정으로 로그인 후 API Key 생성

4. **알리고** (Step 5용)
   - https://www.aligo.in/
   - 회원가입 후 API Key, 발신번호 등록

### 3. .env.local 예시

```env
NEWS_API_KEY=abc123...
GEMINI_API_KEY=AIza...
ALIGO_API_KEY=...
ALIGO_USER_ID=...
ALIGO_SENDER=01012345678
```

---

## 📦 현재 패키지 (Step 1 기준)

- **Next.js 16** (App Router)
- **Tailwind CSS** + **tw-animate-css**
- **lucide-react** (아이콘)

Step 2에서 `@google/generative-ai` 추가 예정.

---

## 🚫 제거된 항목 (DB 없음)

- Supabase (DB, Auth)
- 별도 데이터베이스
- 사용자 출석은 LocalStorage로 관리
