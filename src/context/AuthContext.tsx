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
import { MOCK_AUTH, MOCK_USER } from "@/lib/api/mock";
import type { User } from "@/lib/types";

interface UserContextType {
  user: User | null; // 인증된 유저 (토큰 유효 시 존재)
  profile: User | null; // 닉네임까지 설정된 경우에만 non-null (온보딩 분기용)
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  reload: () => Promise<void>; // 콜백/온보딩 후 세션 재동기화
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

  // refresh 쿠키로 세션 복구 → /users/me 로 유저 로드
  const load = useCallback(async () => {
    setIsLoading(true);
    const token = await refresh();
    if (!token) {
      // 실제 세션이 없을 때, MOCK_AUTH=true면 데모 유저로 화면을 볼 수 있게 한다.
      // 기본(OFF)에서는 null → 로그인 페이지가 정상 노출/동작.
      setUser(MOCK_AUTH ? MOCK_USER : null);
      setIsLoading(false);
      return;
    }
    try {
      setUser(await getMe());
    } catch {
      setUser(MOCK_AUTH ? MOCK_USER : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const profile = user && user.nickname ? user : null;

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        refreshProfile: load,
        reload: load,
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
