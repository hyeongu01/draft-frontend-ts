// 공개 이력서 fetch — 서버 컴포넌트(SSR)에서 호출. 인증 불필요.
// 백엔드 미구현 동안에는 null/[] 폴백으로 화면이 깨지지 않게 한다.
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
