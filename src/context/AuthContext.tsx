"use client";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { refresh } from "@/lib/api/client";
import { getMe, logout as apiLogout } from "@/lib/api/users";
import { saveAccessToken } from "@/lib/auth/token";
import { MOCK_AUTH, MOCK_USER } from "@/lib/api/mock";
import type { User } from "@/lib/types";

interface UserContextType {
  user: User | null; // 인증된 유저 (토큰 유효 시 존재)
  profile: User | null; // 닉네임까지 설정된 경우에만 non-null (온보딩 분기용)
  isLoading: boolean;
  refreshProfile: () => Promise<User | null>; // 토큰 유지, /users/me 만 재조회 (온보딩 후 등)
  setSession: (token: string, user: User) => void; // OAuth 콜백: 교환 응답의 토큰+유저 주입
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 메모리 토큰으로 /users/me 조회 → user 갱신. refresh는 호출하지 않는다.
  const hydrate = useCallback(async (): Promise<User | null> => {
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      // 실제 세션이 없을 때, MOCK_AUTH=true면 데모 유저로 화면을 볼 수 있게 한다.
      const fallback = MOCK_AUTH ? MOCK_USER : null;
      setUser(fallback);
      return fallback;
    }
  }, []);

  // 앱 부팅 시 세션 복구: refresh 쿠키 → accessToken(메모리) + user.
  // refresh 응답이 user를 포함하므로 별도 GET /users/me 왕복은 생략한다.
  // refresh는 "메모리 토큰이 비어있는 시점"에만 필요하므로 여기서만 호출한다.
  const load = useCallback(async () => {
    setIsLoading(true);
    const session = await refresh();
    if (!session) {
      setUser(MOCK_AUTH ? MOCK_USER : null);
      setIsLoading(false);
      return;
    }
    // 계약상 user는 항상 동봉되지만, 누락 시엔 /users/me로 폴백.
    if (session.user) setUser(session.user);
    else await hydrate();
    setIsLoading(false);
  }, [hydrate]);

  useEffect(() => {
    // OAuth 콜백 경로에서는 콜백 핸들러(setSession)가 코드 교환으로 세션을 직접 수립한다.
    // 이때 부팅 refresh가 동시에 돌면, 실패(401) 시 메모리 토큰을 비워 레이스가 난다 → 건너뛴다.
    const path = window.location.pathname;
    if (path === "/auth/callback" || path === "/auth/google/callback") {
      return; // isLoading은 setSession이 관리
    }
    load();
  }, [load]);

  // OAuth 콜백 전용: 코드 교환 응답의 accessToken+user를 그대로 주입 (getMe 불필요).
  const setSession = useCallback((token: string, u: User) => {
    saveAccessToken(token);
    setUser(u);
    setIsLoading(false);
  }, []);

  const profile = user && user.nickname ? user : null;

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        refreshProfile: hydrate,
        setSession,
        logout: apiLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUserContext는 UserProvider 안에서만 사용 가능합니다");
  return ctx;
}
