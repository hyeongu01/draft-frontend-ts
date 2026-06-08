// src/types/resume.ts
// 이력서 content(JSONB) 구조 — "섹션 배열 + 섹션별 Tiptap JSON".
// 검색용 정형 컬럼(job_role, period 등)은 resumes 테이블 컬럼으로 분리, 본문만 여기서.

export type ResumeSection = {
  id: string;
  title: string;
  body: object; // 섹션별 Tiptap ProseMirror JSON (빈 섹션은 {})
};

export type ResumeContent = {
  version: 1;
  sections: ResumeSection[];
};

// 연차 표시 — 0년차는 "신입"
export function formatExperience(years: number): string {
  return years === 0 ? "신입" : `${years}년차`;
}

// 기획서 ⑤ 와이어프레임의 기본 섹션
export const DEFAULT_SECTION_TITLES = [
  "자기소개",
  "경력",
  "프로젝트",
  "학력",
  "스킬",
] as const;

// 빈 ProseMirror 본문
export const EMPTY_BODY: object = {};

// 빈 Tiptap 에디터의 저장 형식 (StarterKit 빈 문서 = editor.getJSON()).
// 이력서 최초 생성 시 content 기본값으로 사용.
export const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
} as const;

// DB의 content(빈 객체·레거시 단일 Tiptap 문서·신규 구조 모두)를 ResumeContent로 정규화.
// 프리셋 id는 SSR/CSR 동일하도록 고정값 사용(랜덤 id는 hydration 불일치 유발).
export function normalizeContent(raw: unknown): ResumeContent {
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as ResumeContent).sections)
  ) {
    return raw as ResumeContent;
  }

  // 레거시: content가 단일 Tiptap 문서({ type: 'doc', ... })였던 경우 자기소개에 흡수
  const legacyBody =
    raw && typeof raw === "object" && (raw as { type?: string }).type === "doc"
      ? (raw as object)
      : undefined;

  return {
    version: 1,
    sections: DEFAULT_SECTION_TITLES.map((title, i) => ({
      id: `sec-${i}`,
      title,
      body: i === 0 && legacyBody ? legacyBody : EMPTY_BODY,
    })),
  };
}
