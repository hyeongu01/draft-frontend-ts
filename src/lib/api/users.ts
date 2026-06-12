// 유저(=프로필) API. swagger 계약 → orval 생성 함수를 그대로 사용.
// 온보딩 닉네임 생성도 PUT /users/me 로 통합.
import {
  usersControllerGetMyProfile,
  usersControllerUpdateMyProfile,
} from "@/lib/api/generated/users/users";
import { authControllerLogout } from "@/lib/api/generated/auth/auth";
import type { UpdateUserDto } from "@/lib/api/generated/model";
import { clearAccessToken } from "@/lib/auth/token";

export const getMe = () => usersControllerGetMyProfile();

// PUT /users/me — 응답은 갱신된 UserResponseType 전체.
// profileImageUrl: temp 업로드 URL 전달 시 영구 경로로 이동, null이면 기본 이미지로 복원.
export const updateMe = (dto: UpdateUserDto) =>
  usersControllerUpdateMyProfile(dto);

export async function logout() {
  try {
    await authControllerLogout();
  } catch {
    // 네트워크 실패해도 클라이언트 토큰은 비운다
  }
  clearAccessToken();
  if (typeof window !== "undefined") window.location.href = "/login";
}
