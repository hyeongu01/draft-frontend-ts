// 인증 사용자용 이력서 API (CSR 페이지에서 호출).
// NOTE: 아래 엔드포인트는 NestJS 백엔드 구현 대기 중인 계약.
import { apiJson } from "./client";
import type { Resume } from "@/lib/types";
import {
  USE_MOCK,
  mockMyResumes,
  mockMyBookmarks,
  mockMyLikes,
  mockResume,
} from "./mock";

export type ResumeUpdate = {
  title?: string;
  description?: string;
  jobRole?: string;
  isPublic?: boolean;
  content?: unknown;
  experienceYears?: number;
};

// 내 데이터
export const getMyResumes = () =>
  USE_MOCK
    ? Promise.resolve(mockMyResumes())
    : apiJson<Resume[]>("/users/me/resumes");
export const getMyBookmarks = () =>
  USE_MOCK
    ? Promise.resolve(mockMyBookmarks())
    : apiJson<Resume[]>("/users/me/bookmarks");
export const getMyLikes = () =>
  USE_MOCK ? Promise.resolve(mockMyLikes()) : apiJson<Resume[]>("/users/me/likes");

// 단건 (소유자/공개 여부는 백엔드가 판단)
export const getResume = (id: string) =>
  USE_MOCK ? Promise.resolve(mockResume(id)) : apiJson<Resume>(`/resumes/${id}`);

// 인증 사용자 기준 좋아요·보관 상태
export const getResumeState = (id: string) =>
  USE_MOCK
    ? Promise.resolve({ liked: false, bookmarked: false })
    : apiJson<{ liked: boolean; bookmarked: boolean }>(`/resumes/${id}/me`);

// 뮤테이션
// 이력서 생성은 swagger 반영됨 → 생성 훅(useResumesControllerCreateItem) 직접 사용.
// (src/app/(app)/me/resumes/new/page.tsx)

export const updateResume = (id: string, updates: ResumeUpdate) =>
  USE_MOCK
    ? Promise.resolve({ ...mockResume(id), ...updates } as Resume)
    : apiJson<Resume>(`/resumes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

export const deleteResume = (id: string) =>
  USE_MOCK
    ? Promise.resolve(null)
    : apiJson<unknown>(`/resumes/${id}`, { method: "DELETE" });

// 좋아요·보관 토글 (on=true→추가, false→삭제)
export const setLike = (id: string, on: boolean) =>
  USE_MOCK
    ? Promise.resolve(null)
    : apiJson<unknown>(`/resumes/${id}/like`, { method: on ? "POST" : "DELETE" });

export const setBookmark = (id: string, on: boolean) =>
  USE_MOCK
    ? Promise.resolve(null)
    : apiJson<unknown>(`/resumes/${id}/bookmark`, {
        method: on ? "POST" : "DELETE",
      });
