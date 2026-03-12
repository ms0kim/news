# API 연결 문제 해결

## 1. 환경 변수 확인

브라우저에서 **http://localhost:3000/api/health** 접속:

```json
{
  "GNEWS_API_KEY": { "set": true, "length": 32, "hasSpaces": false, "trimmed": true },
  "GEMINI_API_KEY": { "set": true, "length": 39, "hasSpaces": false, "trimmed": true }
}
```

- `set: false` → `.env.local`에 키가 없거나 서버 재시작 필요
- `hasSpaces: true` → 키 앞뒤 공백 제거
- `length: 0` → 키가 비어 있음

## 2. 단계별 테스트

### 뉴스 API만 테스트
```
http://localhost:3000/api/news
```
- 성공: 뉴스 배열 반환
- 실패: GNews API 키 또는 할당량 문제

### 인사이트 API 전체 테스트
```
http://localhost:3000/api/insights
```
- 실패 시 응답의 `details` 필드에 구체적 에러 메시지 포함

### AI 인사이트 디버깅 (단계별)
```
http://localhost:3000/api/insights/debug
```
- 1단계: API 키 설정 여부
- 2단계: 뉴스 수집 & 번역 (성공 시 뉴스 개수, 미리보기)
- 3단계: Gemini AI 분석 (성공 시 sectors, stocks, summary 등)
- 어느 단계에서 실패하는지, 에러 메시지가 무엇인지 확인 가능

## 3. 자주 나오는 에러

| 에러 메시지 | 원인 | 조치 |
|-------------|------|------|
| GNEWS_API_KEY를 .env.local에... | 키 미설정 | .env.local 생성 후 키 추가 |
| Your API key is invalid | 잘못된 키 | GNews 대시보드에서 키 재확인 |
| You have reached your request limit | 일일 한도 초과 | 다음날 00:00 UTC까지 대기 |
| GEMINI_API_KEY를 .env.local에... | 키 미설정 | .env.local 생성 후 키 추가 |
| 404 models/gemini-1.5-flash is not found | 모델 중단됨 | `gemini-2.0-flash`로 변경됨. 여전히 404면 `gemini-pro` 시도 |
| 404/403 (Gemini) | 잘못된 키 또는 모델 | AI Studio에서 새 키 발급 |

## 4. .env.local 체크리스트

1. **파일 위치**: 프로젝트 루트 (`package.json`과 같은 폴더)
2. **형식** (따옴표 없이):
   ```
   GNEWS_API_KEY=abc123...
   GEMINI_API_KEY=AIzaSy...
   ```
3. **저장 후**: `npm run dev` 완전히 종료 후 다시 실행
