# Step 5: Vercel Cron Job

## 구현 내용

### 1. vercel.json
- **경로**: `/api/cron/daily`
- **스케줄**: `0 0 * * *` = 매일 00:00 UTC = **09:00 KST**

### 2. API 라우트
- **app/api/cron/daily/route.ts**
- `CRON_SECRET` 설정 시 Authorization 헤더 검증
- 실행 시 타임스탬프 로그

## 배포 후 설정

### 1. Vercel에 배포
```bash
vercel
```

### 2. CRON_SECRET (선택)
- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
- `CRON_SECRET` 추가 (16자 이상 랜덤 문자열)
- 설정 시 외부에서 cron 엔드포인트 직접 호출 방지

### 3. 동작 확인
- Vercel 대시보드 → Cron Jobs에서 실행 이력 확인
- 또는 매일 9시(KST)에 자동 실행

## 참고
- Cron은 **프로덕션** 배포에서만 실행됨 (프리뷰 배포 제외)
- 로컬에서는 `curl http://localhost:3000/api/cron/daily` 로 수동 테스트 가능
