// 유저(=프로필) API. swagger 계약 → orval 생성 함수를 그대로 사용.
// 온보딩 닉네임 생성도 PUT /users/me 로 통합.
import {
  usersControllerGetMyProfile,
  usersControllerUpdateMyProfile,
} from "@/lib/api/generated/users/users";
import { authControllerLogout } from "@/lib/api/generated/auth/auth";
import { clearAccessToken } from "@/lib/auth/token";

export const getMe = () => usersControllerGetMyProfile();

export const updateMe = (nickname: string) =>
  usersControllerUpdateMyProfile({ nickname });

export async function logout() {
  try {
    await authControllerLogout();
  } catch {
    // 네트워크 실패해도 클라이언트 토큰은 비운다
  }
  clearAccessToken();
  if (typeof window !== "undefined") window.location.href = "/login";
}
