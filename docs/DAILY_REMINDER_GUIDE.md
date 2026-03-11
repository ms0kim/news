# 데일리 리마인더 구현 가이드 (무료 방법만)

앱 하단의 "데일리 리마인더" 토글을 켰을 때, 매일 오전 9시에 알림을 보내는 **무료로 구현 가능한** 방법만 정리했습니다.

---

## 1. 외부 Cron + 이메일 (추천, 100% 무료)

**비용**: 무료  
**필요**: cron-job.org(무료), Resend/SendGrid 무료 티어(월 100~300통)

### 구현 단계

1. **이메일 저장**: 설정 화면에 이메일 입력 → Vercel KV(무료 256MB) 또는 Upstash Redis(무료)에 저장
2. **Resend 가입**: [resend.com](https://resend.com) → 무료 100통/일
3. **Cron API 수정**: `/api/cron/daily`에서 구독자 이메일 목록 조회 후 발송
4. **cron-job.org 설정**:
   - [cron-job.org](https://cron-job.org) 가입 (무료)
   - 새 Cron Job 생성
   - URL: `https://your-app.vercel.app/api/cron/daily`
   - Schedule: 매일 00:00 UTC (= 한국 09:00)
   - Headers: `Authorization: Bearer ${CRON_SECRET}`

### 환경 변수

```env
RESEND_API_KEY=re_xxxxx
CRON_SECRET=랜덤문자열
```

---

## 2. 외부 Cron + 웹훅 (알림 없이 캐시만)

**비용**: 무료  
**용도**: 매일 뉴스 캐시 갱신만 필요할 때

- cron-job.org로 `/api/cron/daily` 호출
- API에서 뉴스/인사이트 미리 생성 (사용자 접속 시 빠른 로딩)
- 알림은 보내지 않음

---

## 3. 브라우저 알림 (Notification API)

**비용**: 무료  
**한계**: 앱 탭이 열려 있어야 함. 브라우저 종료 시 알림 불가

```js
// 사용자가 알림 허용 후
if (Notification.permission === "granted") {
  new Notification("투자 뉴스 인사이트", {
    body: "오늘의 AI 픽을 확인해 보세요!",
  });
}
```

- 실용성: 낮음 (탭 유지 필요)

---

## 4. PWA + Web Push (무료, 조건부)

**비용**: 무료  
**조건**: VAPID 키 생성, Service Worker 푸시 등록

- Firebase Cloud Messaging(FCM): 무료
- OneSignal: 무료 티어 (월 10,000구독자)
- 구현 복잡도: 높음

---

## 요약: 가장 쉬운 무료 방법

| 순서 | 방법 | 난이도 |
|------|------|--------|
| 1 | cron-job.org + Resend 이메일 | ⭐ 낮음 |
| 2 | cron-job.org + 캐시 갱신만 | ⭐ 낮음 |
| 3 | 브라우저 Notification (탭 열림 시) | ⭐ 낮음 |
| 4 | FCM/OneSignal 웹 푸시 | ⭐⭐⭐ 높음 |

**추천**: 1번(이메일)으로 시작 → 필요 시 4번(푸시) 확장
