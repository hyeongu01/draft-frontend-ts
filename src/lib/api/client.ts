// 클라이언트 전용 API 래퍼.
// - 모든 호출 credentials:'include' (refresh_token HttpOnly 쿠키 전송)
// - 보호 API에 Authorization: Bearer <accessToken>
// - 401 → /auth/refresh 1회 재시도 → 실패 시 /login
import {
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
} from "@/lib/auth/token";

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
export async function refresh(): Promise<string | null> {
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
    const token = json?.data?.accessToken ?? null;
    saveAccessToken(token);
    return token;
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
    const token = await refresh();
    if (!token) {
      clearAccessToken();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new ApiError(401, "unauthenticated");
    }
    res = await call(token);
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
