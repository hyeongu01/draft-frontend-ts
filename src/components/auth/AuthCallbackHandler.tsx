"use client";
// 백엔드가 OAuth 성공 후 FRONTEND_URL/<callback>#accessToken=... 로 리다이렉트.
// 해시는 서버로 전송되지 않으므로 반드시 클라이언트에서 파싱한다.
// /auth/callback 과 /auth/google/callback 양쪽에서 동일하게 사용.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAccessToken } from "@/lib/auth/token";
import { refresh } from "@/lib/api/client";
import { getMe } from "@/lib/api/users";
import { useUserContext } from "@/context/AuthContext";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const { reload } = useUserContext();

  useEffect(() => {
    (async () => {
      // 1) 해시(또는 쿼리)에서 accessToken 추출 → 메모리에 저장
      const hash = window.location.hash.slice(1);
      const search = window.location.search.slice(1);
      const params = new URLSearchParams(hash || search);
      const hashToken = params.get("accessToken");
      if (hashToken) saveAccessToken(hashToken);
      window.history.replaceState({}, "", window.location.pathname);

      // 2) 토큰 확보 (해시가 없으면 refresh 쿠키로)
      const token = hashToken ?? (await refresh());
      if (!token) {
        router.replace("/error?reason=oauth_failed");
        return;
      }

      // 3) 프로필 조회 → 닉네임 유무로 분기
      const me = await getMe().catch(() => null);
      await reload(); // 전역 컨텍스트 동기화
      if (!me) router.replace("/error?reason=no_user");
      else if (me.nickname) router.replace("/");
      else router.replace("/onboarding");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      로그인 처리 중…
    </div>
  );
}
