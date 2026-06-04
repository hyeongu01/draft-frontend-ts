// 유저(=프로필) API. 온보딩 닉네임 생성도 PUT /users/me 로 통합.
import { apiJson, apiFetch } from "./client";
import { clearAccessToken } from "@/lib/auth/token";
import type { User } from "@/lib/types";

export const getMe = () => apiJson<User>("/users/me");

export const updateMe = (nickname: string) =>
  apiJson<User>("/users/me", {
    method: "PUT",
    body: JSON.stringify({ nickname }),
  });

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // 네트워크 실패해도 클라이언트 토큰은 비운다
  }
  clearAccessToken();
  if (typeof window !== "undefined") window.location.href = "/login";
}
