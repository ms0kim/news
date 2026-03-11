# Step 4: UI 컴포넌트 및 실시간 API 데이터 바인딩

## 구현 내용

### 1. 데이터 페칭
- **lib/hooks/useInsights.ts**: `useInsights()` 훅
  - `/api/insights` 호출
  - `data`, `loading`, `error`, `refetch` 반환

### 2. Context Provider
- **app/components/insights-provider.tsx**: `InsightsProvider`, `useInsightsContext()`
  - 페이지 진입 시 한 번만 API 호출
  - 하위 컴포넌트에서 공유

### 3. 컴포넌트 업데이트

| 컴포넌트 | 변경 사항 |
|----------|-----------|
| **TodayHighlight** | `sectors` API 연동, 로딩/에러 UI |
| **NewsFeed** | `news` API 연동, KR 토글(translatedTitle), 링크 클릭 시 원문 |
| **ActionPlan** | `actionPlan` API 연동, 완료 상태 LocalStorage 저장 |
| **GrowthTracker** | 기존 LocalStorage 유지 (변경 없음) |
| **SettingsPanel** | 기존 LocalStorage 유지 (변경 없음) |

### 4. 로딩/에러 처리
- 로딩: 스피너 + 안내 문구
- 에러: 메시지 표시, NewsFeed에 "다시 시도" 버튼
- Fallback: API 실패 시 기본 데이터 표시

### 5. LocalStorage 활용
- **actionPlanCompleted**: 액션플랜 체크 상태
- **investmentStreak**, **activityData**, **lastVisit**: Growth Tracker (기존)
- **dailyNotifications**: 알림 설정 (기존)

## 다음 단계 (Step 5)

- Vercel Cron Job 설정
- 알리고 API 알림톡 연동
