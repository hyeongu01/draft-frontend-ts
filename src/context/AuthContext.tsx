"use client";
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvier({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
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
