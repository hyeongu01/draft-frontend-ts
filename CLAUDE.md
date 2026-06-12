# Drafted (프론트엔드)

이력서를 시기별로 정리하고, 또래에게 공유·피드백받는 직장인 커뮤니티 서비스의 **프론트엔드 레포**.

> 백엔드는 **별도 NestJS 레포**에서 사용자가 직접 개발한다. 이 레포는 프론트엔드 전용이며, 둘의 계약은 `api/swagger.json`으로만 맞춘다.

## 컨셉

직장인이 회사·시기별로 이력서를 누적·관리하면서, 다른 사람의 이력서를 보고 또래 피드백을 주고받는 공간. 한 사용자가 여러 이력서를 가지며, 각 이력서는 한 회사·시기에 해당.

**타겟**: 이직을 고민하거나 여러 회사를 거친 2~10년차 직장인 (IT·디자인·기획 직군 초기 집중).

**MVP 핵심 동선**: 로그인 → 이력서 작성·공개 → 다른 사람 이력서 피드 탐색 → 좋아요·보관 → 1:1 채팅으로 피드백 요청.

기획 전문은 `drafted_planning.html`에 있다. 화면·동선·기능 범위는 여기서 가져오고, 구현 중 기획 변경이 필요하면 임의로 바꾸지 말고 사용자와 상의해 업데이트한다.

## 기술 스택

| 영역      | 선택                                          |
| --------- | --------------------------------------------- |
| Frontend  | Next.js 15 (App Router) + TypeScript          |
| 스타일    | Tailwind CSS + shadcn/ui                       |
| 데이터    | TanStack Query + **orval**(swagger→타입·훅 생성)|
| 에디터    | Tiptap (StarterKit + 향후 커스텀 노드)        |
| 백엔드    | **별도 NestJS REST 레포** (사용자가 개발)      |
| 인증      | NestJS 자체 JWT — Google OAuth (GitHub 예정)  |
| 배포      | Vercel                                         |
| 모니터링  | (예정) Sentry + Vercel Analytics              |

> **Supabase는 제거됨.** 과거 Supabase(Auth+Postgrest+RLS) 기반이었으나 NestJS 백엔드로 마이그레이션했다. `@supabase/*`에 다시 의존하지 말 것.

## 백엔드 협업 모델 (중요)

- **단일 진실 출처는 `api/swagger.json`.** 모든 API 연동(엔드포인트·요청/응답 타입·에러)은 이 파일을 근거로 한다. 추측으로 엔드포인트를 호출·정의하지 않는다.
- swagger.json 갱신 방법 2가지:
  1. 사용자가 직접 `api/swagger.json`을 교체
  2. `sync-swagger` 스킬 — 로컬 백엔드(`http://localhost:4000/docs`)를 호출해 `api/swagger.json`으로 동기화
- **API 코드는 orval로 자동 생성**한다: `api/swagger.json` → TS 타입 + TanStack Query 훅 (`npm run gen:api` → `src/lib/api/generated/`). swagger가 바뀌면 항상 재생성한다. 타입·훅을 손으로 짜지 않는다.
- **시니어 프론트로서 계약에 의견을 낸다.** 누락 엔드포인트/필드, 비효율 응답(N+1·페이지네이션 부재), 봉투 불일치, 네이밍·nullable 모호성, 개인정보 우려를 발견하면 *우회하지 말고* "왜 필요한지 + 제안 스키마(요청/응답 예시) + 영향 범위"를 갖춰 사용자에게 요청한다.
- 백엔드 미구현 계약은 `USE_MOCK` + `src/lib/api/mock.ts`로 임시 진행하거나 TODO로 막는다.

프론트 구현 작업은 `.claude/agents/senior-frontend.md` 에이전트가 위 원칙대로 수행한다.

## 확정 아키텍처 (NestJS 연동)

- **인증 토큰**: accessToken은 **메모리**(`src/lib/auth/token.ts`, 모듈 변수 — localStorage 아님, XSS 안전). refreshToken은 **HttpOnly 쿠키**. 모든 API 호출 `credentials:'include'` 필수.
- **세션 복구**: 앱 시작 시 `POST /auth/refresh`(쿠키만, 바디 없음) → `{ data: { accessToken } }`로 메모리 복구. 401 → refresh 1회 재시도 → 실패 시 `/login`.
- **OAuth**: 구글 구현됨(GitHub 예정). 프론트는 `GET {API}/auth/google/login`으로 **페이지 이동**(fetch 아님). 백엔드 콜백이 `FRONTEND/auth/callback#accessToken=...` **해시**로 리다이렉트 → 콜백 페이지는 **클라이언트 page.tsx**여야 함(해시는 서버로 안 감).
- **응답 봉투**: 모든 응답 `{ statusCode, timestamp, data }`. 실제 페이로드는 `.data` (`apiJson`이 자동으로 벗김).
- **렌더링 분리**: **공개 페이지만 SSR**(`/` 피드, `/resumes/[id]` 공개 fetch). **나머지 전부 CSR**(`/me`, edit, new, onboarding — `apiFetch`/`apiJson`).
- **권한**: 백엔드(NestJS)가 소유권·공개여부를 직접 검증. 프론트는 클라이언트 가드 + UX 처리만. (과거 RLS·미들웨어·Server Action 보호 패턴은 폐기됨 — accessToken이 메모리라 Server Action에서 못 읽음. mutation은 클라이언트 `apiFetch`로.)

## 폴더 구조

```
src/
├── app/
│   ├── (app)/                              # 네비바 있는 메인 앱
│   │   ├── layout.tsx                      # 공통 상단 네비
│   │   ├── page.tsx                        # /            메인 피드 (SSR 공개)
│   │   ├── me/
│   │   │   ├── page.tsx                    # /me          대시보드 (CSR)
│   │   │   └── resumes/
│   │   │       ├── new/page.tsx            # 새 이력서 작성
│   │   │       └── [id]/edit/
│   │   │           ├── page.tsx
│   │   │           └── EditResumeForm.tsx  # Client Component (form)
│   │   └── resumes/[id]/page.tsx           # 공개 이력서 상세 (SSR 공개)
│   ├── (auth)/                             # 네비바 없는 인증
│   │   ├── login/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── error/page.tsx
│   └── auth/
│       ├── callback/page.tsx               # OAuth 해시 콜백 (클라이언트)
│       └── google/callback/page.tsx
├── components/
│   ├── ui/                                 # shadcn/ui
│   ├── auth/                               # AuthCallbackHandler 등
│   ├── layout/                             # AppHeader
│   └── resume/                             # ResumeCard, ResumeEditor, ResumeSections, ...
├── context/AuthContext.tsx                 # 인증 컨텍스트 (accessToken 메모리)
├── hooks/useAuth.ts
├── components/providers/QueryProvider.tsx  # TanStack Query Provider (root layout에 래핑)
└── lib/
    ├── api/
    │   ├── client.ts                       # apiFetch / apiJson (봉투 벗김, 401 재시도)
    │   ├── orval-fetcher.ts                # ★ orval 커스텀 mutator (apiJson 재사용)
    │   ├── generated/                       # ★ orval 자동 생성 (타입+훅) — 수동 편집 금지
    │   ├── users.ts / public.ts            # 생성 훅 위 얇은 래퍼 (users는 인증 부수처리)
    │   └── mock.ts                         # 인증 목업(MOCK_AUTH)만 잔존 — 데이터 mock은 전부 실연동으로 제거됨
    ├── auth/token.ts                       # accessToken 메모리 보관
    ├── types.ts / src/types/               # 도메인 타입 (swagger와 일치 유지)
    └── utils.ts

api/
└── swagger.json                            # ★ 단일 진실 출처 (백엔드 OpenAPI)

orval.config.ts                             # swagger → generated 코드 생성 설정

.claude/
├── agents/senior-frontend.md               # 시니어 프론트 에이전트
└── skills/sync-swagger/SKILL.md            # swagger 동기화 스킬
```

## 핵심 설계 원칙

### 1. Vertical slice 개발

가로(전체 레이어)가 아니라 세로(한 기능을 위→아래 끝까지)로. 한 vertical 끝나면 다음으로.

### 2. Contract-first within feature

각 기능 시작 시 `api/swagger.json`에서 해당 엔드포인트 계약을 먼저 확인한다. 계약이 없거나 부족하면 사용자에게 요청한 뒤(또는 mock으로) 진입.

### 3. Server Component vs Client Component 분리

- Server Component: 공개 데이터 fetching, 초기 데이터 준비 (SSR 공개 페이지)
- Client Component (`'use client'`): 상태, 이벤트, 인터랙션, 인증이 필요한 fetch/mutation
- 둘은 props로 한 번만 연결. 상태가 필요한 부분만 Client로 떼어냄.

### 4. API는 orval 생성 훅으로

swagger에 있는 엔드포인트는 **orval 생성 훅(`useXxxControllerYyy`)** 을 직접 쓴다. 손으로 fetch/타입을 짜지 않는다. 생성 훅은 커스텀 mutator(`orval-fetcher.ts`)를 통해 `apiJson`을 재사용하므로 인증·봉투 처리가 동일하게 적용되고, 훅의 `data`는 봉투 내부 payload다. 아직 swagger에 없는 영역만 `apiJson` + `USE_MOCK` 래퍼로 임시 처리.

### 5. Tiptap 락인 최소화

이력서 데이터는 "섹션 배열 + 도메인 필드 + 부분 Tiptap JSON" 구조로 저장(전체를 Tiptap JSON 한 덩어리에 박지 않음). 페이지가 Tiptap API를 직접 호출하지 않게 얇은 래퍼(`ResumeEditor`)로 감쌈.

## 코딩 컨벤션

### CSR 페이지 패턴 (생성 훅 사용)

```tsx
"use client";
// swagger에 있는 엔드포인트 → orval 생성 훅 직접 사용
import { useUsersControllerGetMyProfile } from "@/lib/api/generated/users/users";

export default function MePage() {
  const { data: me, isLoading } = useUsersControllerGetMyProfile();
  // data는 봉투 벗긴 payload. 401 재시도/리다이렉트는 customFetch가 처리.
  if (isLoading) return <Spinner />;
  // ...
}
```

### 코드 생성 / 동기화

```bash
npm run gen:api   # api/swagger.json → src/lib/api/generated/ (타입+훅)
# 백엔드 계약이 바뀌면: /sync-swagger 로 swagger.json 갱신 후 위 명령으로 재생성
```

### 임시 래퍼 패턴 (swagger 미반영 영역만)

```ts
// resumes/likes/bookmarks 처럼 아직 백엔드에 없는 계약만 임시로.
import { apiJson } from "./client";
export const getMyResumes = () => apiJson<Resume[]>("/users/me/resumes");
// 계약이 swagger에 들어오면 생성 훅으로 교체.
```

### SSR 공개 페이지 패턴

```tsx
import { getPublicResume } from "@/lib/api/public"; // 비인증 fetch

export default async function ResumePage({ params }) {
  const { id } = await params; // Next 15: params는 Promise
  const resume = await getPublicResume(id);
  return <ResumeView resume={resume} />;
}
```

### 파일·폴더 컨벤션

- 페이지: `page.tsx`. 공개=Server Component, 인증 필요=내부에 Client Component.
- Client Component: PascalCase 별도 파일 (`EditResumeForm.tsx`), 최상단 `'use client'`.
- API 래퍼: `src/lib/api/*.ts`.
- Next 15부터 `params`는 Promise: `const { id } = await params`.

### 응답 톤

사용자는 한국어로 대화 진행. 답변은 간결하고 핵심 위주. 코드는 풀로 보여주되 설명은 필요한 부분만. 과도한 머리말·꼬리말 없이 바로 본론.

## 백엔드 엔드포인트 현황 (2026-06, swagger.json이 권위)

구현됨: `GET /auth/google/login`, `GET /auth/google/callback`(구글이 호출), `POST /auth/refresh`(쿠키), `POST /auth/logout`(Bearer), `GET|PUT|DELETE /users/me`(Bearer, PUT는 `{nickname}`).

미구현(프론트가 계약 정의해 요청 대기): **resumes / likes / bookmarks / chat 전부**. `src/lib/api/resumes.ts` 등의 함수는 현재 `USE_MOCK`으로 동작하는 *제안 계약*이다. 온보딩 닉네임 생성 = `PUT /users/me {nickname}` (별도 profiles 없이 users로 통합).

> 위 현황은 참고용. **실제 계약은 항상 `api/swagger.json`을 확인**하고, 어긋나면 코드를 swagger에 맞추거나 계약 변경을 요청한다.

## 현재 진행 상황

### 완료

- NestJS 백엔드로 인증 마이그레이션 (구글 OAuth, accessToken 메모리 + refresh 쿠키)
- `apiFetch`/`apiJson` 클라이언트, 401 재시도, 응답 봉투 처리
- `/login`, `/auth/callback`(해시), `/onboarding`(닉네임 = `PUT /users/me`)
- `/me` 대시보드, `/me/resumes/new`, `/me/resumes/[id]/edit`
- Tiptap 통합 (`ResumeEditor`), 공개 이력서 화면 골격 (`ResumeCard`, `ResumeSections`)
- `USE_MOCK` + `mock.ts`로 resumes/likes/bookmarks 임시 동작

### 다음 작업

- resumes/likes/bookmarks **백엔드 계약 확정** → swagger 반영 → mock 제거하고 실연동
- `/` 메인 피드 (SSR 공개) 실데이터 연동
- 좋아요·보관 (useOptimistic)
- 채팅(`chat_rooms`/`messages` 계약 정의 → Realtime 대안 설계, NestJS WebSocket/SSE 협의)
- 직무·연차 필터 (`/explore`)
- Tiptap 커스텀 섹션 노드 + 슬래시 커맨드

## 디자인 의사결정 기록

- **OAuth만, 이메일/비번 X**: Google + GitHub(예정). 비밀번호·이메일 인증 흐름 회피.
- **닉네임은 온보딩에서만**: 직무·연차는 첫 이력서 작성 시 자연 수집. 가입 부담 최소화.
- **Tiptap 다중 인스턴스(섹션마다 에디터)**: 하나의 ProseMirror 문서가 아니라 섹션별 별도 에디터.
- **PDF 업로드는 v2 이후**: MVP는 자체 에디터로 통일.
- **카카오 OAuth 안 함**: Google + GitHub만. 타겟이 IT·디자인 직군 중심.
- **개인정보 정책**: 공개 이력서에서 본명·연락처 절대 노출 안 함. 공개 정보는 **닉네임 + 프로필 이미지**(온보딩에서 수집, 이미지는 선택·스킵 가능). 식별정보 교환은 채팅에서 본인 의지로. (2026-06 결정: 프로필 이미지를 공개 정보로 확장)
- **Supabase → NestJS**: RLS/Server Action 우회 위험 및 백엔드 자율성 위해 자체 NestJS로 이전. 인증은 메모리 accessToken + HttpOnly refresh.

## 자주 발생하는 함정

- swagger.json을 확인 안 하고 추측으로 엔드포인트 호출 → 계약 불일치. **항상 `api/swagger.json` 먼저.**
- OAuth 콜백 페이지를 Server Component로 만들면 깨짐 — 해시(`#accessToken`)는 서버로 안 감. **클라이언트 page.tsx**여야 함.
- 모든 호출에 `credentials:'include'` 빠지면 refresh 쿠키 미전송 → 세션 복구 실패.
- accessToken을 localStorage에 보관(XSS 위험) 또는 Server Action에서 읽으려 시도 → 메모리라 불가.
- Next 15부터 `params`는 Promise → `await params`.
- 환경변수(`NEXT_PUBLIC_API_URL`) 바꿨으면 dev 서버 재시작 필수.
- `@supabase/*` 재도입 금지 (마이그레이션으로 제거됨).
- **패키지 매니저는 npm**(`package-lock.json`이 정본). `pnpm`/`yarn` 쓰지 말 것 — 다른 락파일이 생기면 Vercel `frozen-lockfile` 빌드가 깨진다. 의존성은 항상 `npm install`/`npm i <pkg>`.
