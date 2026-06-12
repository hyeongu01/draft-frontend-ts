// 백엔드 미구현 구간용 목업 데이터.
// 현재 남은 용도: /me 보관함·좋아요 탭의 "이력서 목록" (id 목록 계약만 있고 목록 계약 부재).
// 좋아요·스크랩 토글/상태는 실 API(생성 훅)로 전환 완료 → src/hooks/useResumeReactions.ts
import type { Resume, User } from "@/lib/types";

// swagger 미반영 영역 목업 스위치 — 기본 ON. 새 임시 계약 추가 시 재사용.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// 인증 목업(데모 유저) — 기본 OFF. true일 때만 백엔드 없이 /me·편집을 본다.
// (OFF여야 실제 구글 로그인 플로우가 정상 동작)
export const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

// ── ProseMirror(Tiptap) 본문 빌더 ───────────────────────────
const p = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const bullets = (items: string[]) => ({
  type: "bulletList",
  content: items.map((t) => ({
    type: "listItem",
    content: [p(t)],
  })),
});
const doc = (...nodes: object[]) => ({ type: "doc", content: nodes });

function buildContent(sections: { title: string; body: object }[]) {
  return {
    version: 1 as const,
    sections: sections.map((s, i) => ({
      id: `sec-${i}`,
      title: s.title,
      body: s.body,
    })),
  };
}

// 현재 로그인 유저로 가정하는 목업 소유자 id
export const MOCK_ME_ID = "me";

// 백엔드 없이도 인증 화면(/me·편집)을 볼 수 있게 하는 데모 유저
export const MOCK_USER: User = {
  id: MOCK_ME_ID,
  nickname: "데모유저",
  name: "데모",
  email: "demo@example.com",
  profileImageUrl: null,
  createdAt: { ISOFormat: "2026-01-01T00:00:00.000Z", timeAgo: "오래 전" },
  updatedAt: { ISOFormat: "2026-01-01T00:00:00.000Z", timeAgo: "오래 전" },
};

function makeResume(r: Partial<Resume> & Pick<Resume, "id" | "title">): Resume {
  return {
    userId: "u-other",
    description: null,
    jobRole: null,
    content: {},
    isPublic: true,
    viewCount: 0,
    likeCount: 0,
    scrapCount: 0,
    experienceYears: 0,
    author: { nickname: "익명" },
    ...r,
  };
}

const RESUMES: Resume[] = [
  makeResume({
    id: "mock-1",
    userId: "u-jihye",
    title: "스타트업 3년, 0→1 프로덕트 디자이너",
    description: "디자인 시스템 구축과 사용자 리서치 중심으로 성장한 3년 정리",
    jobRole: "프로덕트 디자이너",
    experienceYears: 3,
    likeCount: 42,
    scrapCount: 17,
    viewCount: 318,
    author: { nickname: "jihye_kim" },
    content: buildContent([
      {
        title: "자기소개",
        body: doc(
          p(
            "사용자 문제를 구조로 풀어내는 걸 좋아하는 프로덕트 디자이너입니다. 작은 팀에서 리서치부터 출시까지 책임지며 일했습니다.",
          ),
        ),
      },
      {
        title: "경력",
        body: doc(
          p("토스랩 · 프로덕트 디자이너 (2022–현재)"),
          bullets([
            "신규 온보딩 플로우 개편으로 가입 전환율 18% 개선",
            "디자인 시스템 v2 도입, 컴포넌트 재사용률 70% 달성",
          ]),
        ),
      },
      {
        title: "스킬",
        body: doc(bullets(["Figma", "사용자 리서치", "프로토타이핑", "디자인 시스템"])),
      },
    ]),
  }),
  makeResume({
    id: "mock-2",
    userId: "u-min",
    title: "백엔드 5년차 — 트래픽 10배 견딘 이야기",
    description: "결제 시스템과 대용량 트래픽 처리 경험 위주",
    jobRole: "백엔드 엔지니어",
    experienceYears: 5,
    likeCount: 88,
    scrapCount: 53,
    viewCount: 921,
    author: { nickname: "min.dev" },
    content: buildContent([
      {
        title: "자기소개",
        body: doc(
          p("안정성과 확장성을 고민하는 백엔드 엔지니어입니다. 장애를 줄이는 설계에 관심이 많습니다."),
        ),
      },
      {
        title: "경력",
        body: doc(
          p("커머스 플랫폼 · 백엔드 (2020–현재)"),
          bullets([
            "결제 서버 재설계로 피크 타임 응답속도 40% 단축",
            "이벤트 트래픽 10배 상황에서 무중단 운영",
          ]),
        ),
      },
    ]),
  }),
  makeResume({
    id: "mock-3",
    userId: "u-soa",
    title: "기획자에서 PM으로 — 2년의 전환기",
    description: "데이터 기반 의사결정을 배우며 PM으로 자리잡은 과정",
    jobRole: "프로덕트 매니저",
    experienceYears: 2,
    likeCount: 23,
    scrapCount: 9,
    viewCount: 142,
    author: { nickname: "soa_pm" },
    content: buildContent([
      {
        title: "자기소개",
        body: doc(p("가설을 빠르게 검증하는 PM을 지향합니다.")),
      },
      {
        title: "프로젝트",
        body: doc(
          bullets([
            "리텐션 개선 A/B 테스트 12건 운영, D7 리텐션 6%p 상승",
            "고객 인터뷰 40건 기반 신규 기능 우선순위 재정의",
          ]),
        ),
      },
    ]),
  }),
  // 내 이력서 (소유자 = me)
  makeResume({
    id: "mock-me-1",
    userId: MOCK_ME_ID,
    title: "현재 회사 이력 정리 (작성 중)",
    description: "지금 다니는 회사에서의 경험을 정리하는 중",
    jobRole: "프론트엔드 엔지니어",
    experienceYears: 4,
    isPublic: true,
    likeCount: 5,
    scrapCount: 2,
    viewCount: 60,
    author: { nickname: "나" },
    content: buildContent([
      {
        title: "자기소개",
        body: doc(p("프론트엔드 엔지니어입니다. 사용자 경험과 성능을 함께 챙깁니다.")),
      },
      {
        title: "경력",
        body: doc(bullets(["Next.js 기반 서비스 마이그레이션 주도"])),
      },
    ]),
  }),
  makeResume({
    id: "mock-me-2",
    userId: MOCK_ME_ID,
    title: "첫 회사 회고 (비공개 초안)",
    description: "신입 시절 기록",
    jobRole: "프론트엔드 엔지니어",
    experienceYears: 1,
    isPublic: false,
    author: { nickname: "나" },
    content: buildContent([
      { title: "자기소개", body: doc(p("막 시작한 시절의 기록입니다.")) },
    ]),
  }),
];

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ── 조회 헬퍼 ──────────────────────────────────────────────
export const mockMyBookmarks = (): Resume[] =>
  clone(RESUMES.filter((r) => r.id === "mock-1" || r.id === "mock-2"));

export const mockMyLikes = (): Resume[] =>
  clone(RESUMES.filter((r) => r.id === "mock-2"));
