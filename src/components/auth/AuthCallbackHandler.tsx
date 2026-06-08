"use client";
// 구글이 인가 코드를 쿼리로 실어 /auth/google/callback 으로 리다이렉트한다.
//   /auth/google/callback?code=...   (해시 아님 — 쿼리)
// 코드를 백엔드로 교환(POST /auth/google/callback)하면 accessToken+user(바디) + refreshToken(쿠키)을 받는다.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authControllerGoogleOAuthCallback } from "@/lib/api/generated/auth/auth";
import { useUserContext } from "@/context/AuthContext";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const { setSession } = useUserContext();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search.slice(1));
      const code = params.get("code");
      const oauthError = params.get("error"); // 사용자가 동의 거부 등
      // URL에서 code 제거 (재교환·유출 방지)
      window.history.replaceState({}, "", window.location.pathname);

      if (oauthError || !code) {
        router.replace("/error?reason=oauth_failed");
        return;
      }

      try {
        // 인가 코드 교환 → accessToken+user(바디) + refreshToken(쿠키, device_id 동봉)
        const { accessToken, user } = await authControllerGoogleOAuthCallback({
          code,
        });
        setSession(accessToken, user);
        // 닉네임 유무로 분기 — 신규(null)는 온보딩으로
        router.replace(user.nickname ? "/" : "/onboarding");
      } catch {
        router.replace("/error?reason=oauth_failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      로그인 처리 중…
    </div>
  );
}
