// 백엔드 미구현 구간용 목업 스위치·데이터.
// resumes/likes/scraps(보관함 목록 포함)는 전부 실 API(생성 훅·fetcher)로 전환 완료 →
// 목업 이력서 데이터는 제거됨. 현재 남은 용도는 인증 목업(MOCK_AUTH)뿐.
import type { User } from "@/lib/types";

// swagger 미반영 영역 목업 스위치 — 기본 ON. 새 임시 계약 추가 시 재사용.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// 인증 목업(데모 유저) — 기본 OFF. true일 때만 백엔드 없이 /me·편집을 본다.
// (OFF여야 실제 구글 로그인 플로우가 정상 동작)
export const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

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
