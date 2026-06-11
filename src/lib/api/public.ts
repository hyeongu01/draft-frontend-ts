// 공개 이력서 fetch — 서버 컴포넌트(SSR)에서 호출. 인증 불필요.
// 경로/타입은 손으로 적지 않고 orval 생성 함수에 위임한다(단일 진실 출처 = swagger).
//  - GET /public/resumes      → publicResumesControllerFindAllPublicItems
//  - GET /public/resumes/{id} → publicResumesControllerFindOnePublicItem
// 생성 함수는 customFetch(=apiJson)를 거쳐 봉투를 벗긴 payload를 반환한다.
// SSR 편의상 실패/404는 null·[] 폴백으로 감싼다(상세는 page에서 notFound 처리).
//
// 남은 계약 공백: PublicUserResponseType에 user.id 없음 → 공개 상세 owner-edit 판별 불가(현재 숨김).
import {
  publicResumesControllerFindAllPublicItems,
  publicResumesControllerFindOnePublicItem,
} from "@/lib/api/generated/resumes-public/resumes-public";
import type {
  ResumeResponseType,
  PublicResumesControllerFindAllPublicItemsParams,
} from "@/lib/api/generated/model";

export async function getPublicResumes(
  params: PublicResumesControllerFindAllPublicItemsParams = {},
): Promise<ResumeResponseType[]> {
  try {
    const data = await publicResumesControllerFindAllPublicItems(params);
    return data?.items ?? [];
  } catch {
    return [];
  }
}

export async function getPublicResume(
  id: string,
): Promise<ResumeResponseType | null> {
  try {
    return await publicResumesControllerFindOnePublicItem(id);
  } catch {
    return null;
  }
}
