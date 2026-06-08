// 클라이언트 전용 API 래퍼.
// - 모든 호출 credentials:'include' (refresh_token HttpOnly 쿠키 전송)
// - 보호 API에 Authorization: Bearer <accessToken>
// - 401 → /auth/refresh 1회 재시도 → 실패 시 /login
import {
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
} from "@/lib/auth/token";
import type { User } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// refresh_token 쿠키로 accessToken 재발급 (바디 없음).
// 응답 data = { accessToken, user } (swagger AccessTokenResponseType) → user까지 반환해
// 부팅 시 별도 GET /users/me 왕복을 생략할 수 있게 한다.
export type RefreshResult = { accessToken: string; user: User };

export async function refresh(): Promise<RefreshResult | null> {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      saveAccessToken(null);
      return null;
    }
    const json = await res.json().catch(() => null);
    const accessToken = json?.data?.accessToken ?? null;
    if (!accessToken) {
      saveAccessToken(null);
      return null;
    }
    saveAccessToken(accessToken);
    return { accessToken, user: json.data.user as User };
  } catch {
    saveAccessToken(null);
    return null;
  }
}

function buildInit(init: RequestInit, token: string | null): RequestInit {
  const hasJsonBody =
    typeof init.body === "string" &&
    !(init.headers && "Content-Type" in (init.headers as Record<string, string>));
  return {
    ...init,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const call = (token: string | null) =>
    fetch(`${API}${path}`, buildInit(init, token));

  let res = await call(getAccessToken());
  if (res.status === 401) {
    const session = await refresh();
    if (!session) {
      clearAccessToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new ApiError(401, "unauthenticated");
    }
    res = await call(session.accessToken);
  }
  return res;
}

// 응답 봉투({ data })를 벗겨 data만 반환. 실패 시 ApiError.
export async function apiJson<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await apiFetch(path, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? res.statusText);
  }
  return (json?.data ?? json) as T;
}
