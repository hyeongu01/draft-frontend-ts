// 공개 이력서 fetch — 서버 컴포넌트(SSR)에서 호출. 인증 불필요.
// 백엔드 미구현 동안에는 null/[] 폴백으로 화면이 깨지지 않게 한다.
//
// TODO(백엔드 계약 — 공개 피드/상세 연동 대기):
//  현재 /me/resumes(소유자 CRUD, Bearer)만 구현됨. 공개 피드/상세는 미구현 → 아직 mock.
//  1) 공개 조회용 비인증 엔드포인트 필요 (예: GET /resumes, GET /resumes/{id} 비인증, 익명=공개만).
//  2) [보류] ResumeResponseType에 작성자 닉네임 임베드 필요 — author:{ nickname } 또는 authorNickname.
//     (응답에 userId만 있어 피드 카드에 작성자 표시 불가. 닉네임만 노출이 개인정보 정책.)
//  3) viewCount 미존재 — 카드/상세 조회수 표시하려면 추가, 아니면 UI에서 제거.
//  4) 목록 필터 부재 — 공개여부/직무(categoryId)/연차(careerYears) 필터 쿼리 필요(/explore).
import type { Resume } from "@/lib/types";
import { USE_MOCK, mockPublicResumes, mockResume } from "./mock";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function getPublicResumes(years?: string): Promise<Resume[]> {
  if (USE_MOCK) return mockPublicResumes(years);
  const qs = years ? `?years=${encodeURIComponent(years)}` : "";
  return (await getPublic<Resume[]>(`/resumes${qs}`)) ?? [];
}

export async function getPublicResume(id: string): Promise<Resume | null> {
  if (USE_MOCK) return mockResume(id);
  return getPublic<Resume>(`/resumes/${id}`);
}
