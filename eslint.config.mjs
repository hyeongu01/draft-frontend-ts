import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 빌드 출력·의존성·자동 생성물은 lint 대상에서 제외
  // (eslint . 가 .next 빌드 산출물까지 훑어 수만 건 에러가 나던 문제 해결)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "src/lib/api/generated/**", // orval 자동 생성물 (수동 편집 금지)
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
