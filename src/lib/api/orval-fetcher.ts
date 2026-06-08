// Orval 생성 훅이 사용하는 커스텀 mutator.
// 기존 apiJson을 재사용해 생성 코드도 동일한 인증 흐름을 탄다:
//  - accessToken(메모리) Bearer 부착
//  - credentials:'include' (refresh 쿠키)
//  - 401 → /auth/refresh 1회 재시도 → 실패 시 /login
//  - 응답 봉투({ data }) 자동 벗김 → 생성 타입 T = 봉투 내부 페이로드
import { apiJson } from "./client";

export interface OrvalRequestConfig {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: string;
}

function withQuery(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, String(v)));
    else sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

// Orval이 호출하는 단일 진입점. apiJson이 봉투를 벗기므로 T는 .data 타입.
export const customFetch = <T>(config: OrvalRequestConfig): Promise<T> => {
  const { url, method, params, data, headers, signal } = config;
  return apiJson<T>(withQuery(url, params), {
    method: method.toUpperCase(),
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    ...(headers ? { headers } : {}),
    ...(signal ? { signal } : {}),
  });
};

export default customFetch;

// Orval react-query 클라이언트가 에러 제네릭으로 참조.
export type ErrorType<E> = E;
// 바디 타입 헬퍼(생성 코드 호환용).
export type BodyType<B> = B;
