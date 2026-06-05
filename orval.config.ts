import { defineConfig } from "orval";

// api/swagger.json(단일 진실 출처) → TS 타입 + TanStack Query 훅 생성.
// 생성물은 src/lib/api/generated/ 아래. 인증/봉투 처리는 커스텀 mutator(orval-fetcher)가 담당.
export default defineConfig({
  drafted: {
    input: {
      target: "./api/swagger.json",
      override: {
        // 응답 봉투({ data })를 안쪽 타입으로 벗겨 생성 (customFetch가 런타임에 .data를 벗기므로 정합).
        transformer: "./orval/transformers/unwrap-envelope.js",
      },
    },
    output: {
      mode: "tags-split", // 태그(Auth, Users, ...)별로 파일 분리
      target: "./src/lib/api/generated",
      schemas: "./src/lib/api/generated/model",
      client: "react-query",
      // axios 스타일: mutator가 단일 config 객체를 받고 봉투 벗긴 payload(T)를 반환.
      // (axios 패키지는 실제로 import/사용되지 않음 — customFetch가 클라이언트를 대체)
      httpClient: "axios",
      clean: true, // 재생성 시 생성 폴더 정리
      override: {
        mutator: {
          path: "./src/lib/api/orval-fetcher.ts",
          name: "customFetch",
        },
      },
    },
  },
});
