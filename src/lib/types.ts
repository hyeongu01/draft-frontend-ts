// 백엔드(NestJS) 응답 도메인 타입. Supabase database.types.ts 대체.
import type { UserResponseType } from "@/lib/api/generated/model";

// 유저 = /users/me 응답. orval 생성 타입을 단일 출처로 사용.
export type User = UserResponseType;

export type ResumeAuthor = {
  id?: string;
  nickname: string | null;
};

export type Resume = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  jobRole: string | null; // 레거시 표시용(자유텍스트) — GET 읽기 계약 확정 시 categoryId로 일원화 예정
  content: unknown; // 섹션 배열 + 섹션별 Tiptap JSON (types/resume.ts에서 정규화)
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  scrapCount: number;
  experienceYears: number; // 레거시 표시용 — 백엔드 계약은 careerYears
  // 백엔드 계약(ResumeResponseType) 정렬 필드. 직무는 categoryId 참조(이름은 useCategories로 해석).
  categoryId?: number | null;
  careerYears?: number | null;
  createdAt?: string;
  updatedAt?: string;
  // 백엔드가 응답에 임베딩(권장) — 없으면 화면에서 "익명"으로 폴백
  author?: ResumeAuthor | null;
  // 인증 사용자 기준 상태 (상세 응답에 포함되거나 별도 조회)
  liked?: boolean;
  bookmarked?: boolean;
};

// 백엔드 공통 응답 봉투: { statusCode, timestamp, data }
export type ApiEnvelope<T> = {
  statusCode: number;
  timestamp: string;
  data: T;
};
