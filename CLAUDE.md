# Drafted

이력서를 시기별로 정리하고, 또래에게 공유·피드백받는 직장인 커뮤니티 서비스.

## 컨셉

직장인이 회사·시기별로 이력서를 누적·관리하면서, 다른 사람의 이력서를 보고 또래 피드백을 주고받는 공간. 한 사용자가 여러 이력서를 가지며, 각 이력서는 한 회사·시기에 해당.

**타겟**: 이직을 고민하거나 여러 회사를 거친 2~10년차 직장인 (IT·디자인·기획 직군 초기 집중).

**MVP 핵심 동선**: 로그인 → 이력서 작성·공개 → 다른 사람 이력서 피드 탐색 → 좋아요·보관 → 1:1 채팅으로 피드백 요청.

## 기술 스택

| 영역       | 선택                                              |
| ---------- | ------------------------------------------------- |
| Frontend   | Next.js 15 (App Router) + TypeScript              |
| 스타일     | Tailwind CSS + shadcn/ui                          |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| 인증       | Supabase Auth — Google + GitHub OAuth만           |
| 에디터     | Tiptap (StarterKit + 향후 커스텀 노드)            |
| 배포       | Vercel + Supabase                                 |
| 모니터링   | (예정) Sentry + Vercel Analytics                  |

**ORM 사용하지 않음**: `@supabase/supabase-js` + `supabase gen types`로 충분. Prisma/Drizzle은 RLS 우회 위험이 있어 회피.

## 폴더 구조

```
src/
├── app/
│   ├── (app)/                              # 네비바 있는 메인 앱
│   │   ├── layout.tsx                      # 공통 상단 네비
│   │   ├── page.tsx                        # /            메인 피드
│   │   ├── me/
│   │   │   ├── page.tsx                    # /me          대시보드
│   │   │   └── resumes/
│   │   │       ├── new/page.tsx            # 새 이력서 작성
│   │   │       └── [id]/edit/
│   │   │           ├── page.tsx            # Server Component (fetch)
│   │   │           └── EditResumeForm.tsx  # Client Component (form)
│   │   └── resumes/[id]/page.tsx           # 공개 이력서 상세
│   ├── (auth)/                             # 네비바 없는 인증
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   └── auth/callback/route.ts              # OAuth 콜백 (Route Handler)
├── components/
│   ├── ui/                                 # shadcn/ui
│   ├── layout/
│   ├── resume/
│   └── chat/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # 브라우저용 클라이언트
│   │   ├── server.ts                       # 서버용 클라이언트
│   │   └── middleware.ts                   # 세션 갱신 헬퍼
│   ├── database.types.ts                   # supabase gen types 결과
│   └── utils.ts
├── actions/                                # Server Actions (전 도메인)
│   └── resume.ts
├── hooks/
└── middleware.ts                           # 세션 갱신 + 보호 라우트

supabase/                                   # Supabase CLI 관리
├── migrations/
└── functions/                              # Edge Functions (필요 시점에)
```

## 핵심 설계 원칙

### 1. Vertical slice 개발

가로(백엔드 전체 → 프론트 전체)가 아니라 세로(한 기능을 위→아래 끝까지)로. 한 vertical 끝나면 다음으로.

### 2. Schema-first within feature

각 기능 시작 시 Supabase에 테이블 + RLS 먼저 만들고 UI 진입.

### 3. RLS로 권한 처리 (DB 레벨)

모든 권한 검증을 Postgres RLS로. 미들웨어/코드에서 user_id 수동 비교 안 함. Supabase Auth가 `auth.uid()`를 자동 주입.

### 4. Server Component vs Client Component 분리

- Server Component: 데이터 fetching, 권한 검증, 초기 데이터 준비
- Client Component (`'use client'`): 상태, 이벤트, 인터랙션
- 둘은 props로 한 번만 연결. 상태가 필요한 부분만 Client로 떼어냄.

### 5. Mutations은 Server Actions로

API 라우트 거의 안 만듦. 폼·뮤테이션은 `src/actions/*.ts`에서 `'use server'`로.

### 6. Tiptap 락인 최소화

이력서 데이터는 "섹션 배열 + 도메인 필드 + 부분 Tiptap JSON" 구조로 저장 (전체를 Tiptap JSON 한 덩어리에 박지 않음). 페이지 컴포넌트가 Tiptap API를 직접 호출하지 않게 얇은 래퍼 컴포넌트로 감쌈.

## 코딩 컨벤션

### Server Component 패턴

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("...").select("*");
  return <SomeClientComponent data={data} />;
}
```

### Server Action 패턴

```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function someAction(...) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS에 권한 위임 — user_id 수동 체크 X
  const { error } = await supabase.from('...').insert/update/delete(...)
  if (error) return { error: error.message }

  revalidatePath('/...')        // 캐시 무효화
  // 또는 redirect('/...')
}
```

### 파일·폴더 컨벤션

- 페이지: `page.tsx` (기본 Server Component)
- Route Handler: `route.ts`
- Client Component: PascalCase 별도 파일 (`EditResumeForm.tsx`)
- 액션: `src/actions/*.ts`, 파일 최상단 `'use server'`
- Next 15부터 `params`는 Promise: `const { id } = await params`

### 응답 톤

사용자는 한국어로 대화 진행. 답변은 간결하고 핵심 위주. 코드는 풀로 보여주되 설명은 필요한 부분만. 과도한 머리말·꼬리말 없이 바로 본론.

## 데이터베이스 스키마

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auth.users 생성 시 profiles 자동 생성 트리거
create function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nickname) values (new.id, null);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### resumes

```sql
create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  period_start date,
  period_end date,
  content jsonb not null default '{}'::jsonb,  -- Tiptap ProseMirror JSON
  is_public boolean not null default false,
  view_count integer not null default 0,
  like_count integer not null default 0,
  save_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table resumes enable row level security;

create policy "본인 이력서 전체 권한"
  on resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "공개 이력서는 누구나 읽기"
  on resumes for select
  using (is_public = true);

-- updated_at 자동 갱신
create function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_updated_at
  before update on resumes
  for each row execute function update_updated_at();
```

(향후 추가: `likes`, `bookmarks`, `chat_rooms`, `messages`)

## 현재 진행 상황

### 완료

- Next.js 15 + Supabase 프로젝트 셋업
- shadcn/ui 셋업
- Supabase Auth (Google + GitHub OAuth)
  - `/login` (OAuth 버튼 2개)
  - `/auth/callback/route.ts` (PKCE 코드 → 세션 교환, 신규/기존 분기)
  - `/onboarding` (닉네임 설정)
- `profiles` 테이블 + 자동 생성 트리거
- `resumes` 테이블 + RLS + updated_at 트리거
- TypeScript 타입 자동 생성 (`src/lib/database.types.ts`)
- `/me` (이력서 목록 Server Component + 빈 상태)
- `/me/resumes/new` (제목 입력 폼 + Server Action)
- `/me/resumes/[id]/edit` (Server + Client 분리, 제목·공개 토글·삭제, **Tiptap 미통합**)
- `src/actions/resume.ts`: `createResume`, `updateResume`, `deleteResume`

### 다음 작업 — Tiptap 통합

**목표**: `EditResumeForm.tsx`의 점선 박스 자리에 Tiptap StarterKit 기반 에디터를 넣고, `content` JSONB 필드에 ProseMirror JSON으로 저장·복원.

단계:

1. `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`
2. `src/components/resume/ResumeEditor.tsx` 작성 — Tiptap 래퍼 Client Component (얇게)
3. `EditResumeForm.tsx`에서 점선 박스를 `<ResumeEditor value={...} onChange={...} />`로 교체
4. `content`를 저장 대상에 포함 — `editor.getJSON()` → `updateResume`
5. 저장 정책 결정 (자동 저장 vs 명시적 저장 — 처음엔 명시적 저장 권장)

### 향후 작업 (순서대로)

- `/resumes/[id]` (공개 이력서 상세 페이지)
- `/` (메인 피드)
- `likes`, `bookmarks` 테이블 + 좋아요·보관 (useOptimistic)
- `chat_rooms`, `messages` 테이블 + RLS
- `/chats`, `/chats/[id]` + Supabase Realtime 구독
- 직무·연차 필터 (`/explore`)
- Tiptap 커스텀 섹션 노드 + 슬래시 커맨드
- 마이페이지 보강 (보관함·좋아요·받은 피드백 탭)
- 베타 사용자 모집

## 디자인 의사결정 기록

- **OAuth만, 이메일/비번 X**: Google + GitHub. 비밀번호 관리·이메일 인증·찾기 흐름 전부 회피.
- **닉네임은 온보딩에서만**: 직무·연차는 첫 이력서 작성 시 자연 수집. 가입 시 입력 부담 최소화.
- **Tiptap 다중 인스턴스 (섹션마다 에디터)**: 하나의 ProseMirror 문서가 아니라 섹션별 별도 에디터. 이력서 도메인 구조와 정합성·확장성 우선.
- **PDF 업로드는 v2 이후**: MVP는 자체 에디터로 통일. 검색·표준화·AI 확장의 기반.
- **ORM 없음**: Prisma/Drizzle 도입 시 RLS 우회 위험. supabase-js + 생성 타입으로 충분.
- **유료 Tiptap 확장 미사용**: Comments, AI Toolkit 같은 유료 기능은 OSS로 자체 구현.
- **카카오 OAuth 안 함**: Google + GitHub만. 타겟이 IT·디자인 직군 중심이라 충분.
- **개인정보 정책**: 공개 이력서에서 본명·연락처 절대 노출 안 함. 닉네임만 표시. 식별정보 교환은 채팅에서 본인 의지로.

## 자주 발생하는 함정

- OAuth 콜백의 `forwardedHost` 처리 빠지면 프로덕션에서 리다이렉트 깨짐
- `revalidatePath` 빠뜨리면 Server Component가 옛 데이터 캐싱
- Client Component에서 `'use client'` 빼먹으면 hook 에러
- RLS 정책 안 만들면 데이터 노출. **RLS 활성 + 정책 없음 = 거부**, **RLS 비활성 = 통과** (활성화 필수)
- Next 15부터 `params`는 Promise → `await params`
- Supabase 환경변수 바꿨으면 dev 서버 재시작 필수
- Server Action에서 `redirect()` 호출은 try/catch 안에 두면 안 됨 (Next가 내부 에러로 처리)
