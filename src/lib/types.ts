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
  user_id: string;
  title: string;
  description: string | null;
  job_role: string | null;
  content: unknown; // 섹션 배열 + 섹션별 Tiptap JSON (types/resume.ts에서 정규화)
  is_public: boolean;
  view_count: number;
  like_count: number;
  save_count: number;
  experience_years: number;
  created_at?: string;
  updated_at?: string;
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
