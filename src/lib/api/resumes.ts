// 인증 사용자용 이력서 API (CSR 페이지에서 호출).
//
// swagger 반영 완료 → 생성 훅을 직접 사용 (이 파일에 래퍼 두지 않음):
//   - 이력서 CRUD: useResumesControllerFindAll / CreateItem / UpdateItem / DeleteItem
//   - 좋아요·스크랩 토글: useResumeReactionsControllerToggleLike / ToggleScrap (POST /resumes/like|scrap/{id})
//   - 내 좋아요·스크랩 id 목록: useUsersControllerGetLikeIds / GetScrapIds (GET /users/me/likes|scraps)
//   - 화면 공용 래퍼: src/hooks/useResumeReactions.ts (낙관적 토글 + id 목록 캐시 동기화)
import type { Resume } from "@/lib/types";
import { mockMyBookmarks, mockMyLikes } from "./mock";

// ── 아래는 swagger 미반영 계약 — mock 전용 ──────────────────
// /me 보관함·좋아요 탭에 필요한 "이력서 목록" 엔드포인트가 아직 없다.
// (GET /users/me/likes|scraps 는 id 배열만 반환 — 목록 화면 대조 용도)
// TODO(백엔드 계약 요청): GET /users/me/likes/resumes, /users/me/scraps/resumes
//   — 공개 목록과 동일한 ResumeResponseType[] + 페이지네이션. 확정 시 생성 훅으로 교체.
export const getMyBookmarks = (): Promise<Resume[]> =>
  Promise.resolve(mockMyBookmarks());
export const getMyLikes = (): Promise<Resume[]> =>
  Promise.resolve(mockMyLikes());
