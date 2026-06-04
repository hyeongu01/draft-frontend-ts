import AuthCallbackHandler from "@/components/auth/AuthCallbackHandler";

// 백엔드가 FRONTEND_URL/auth/google/callback#accessToken=... 로 보내는 경우 대응.
export default function GoogleAuthCallbackPage() {
  return <AuthCallbackHandler />;
}
