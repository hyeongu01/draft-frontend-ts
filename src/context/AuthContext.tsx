"use client";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { type Profile } from "@/lib/profile";

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);
const supabase = createClient();

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) console.error(error.message);
    setProfile(data ?? null);
  };

  const refreshProfile = async () => {
    if (!user) throw new Error("user_not_found");
    setIsLoading(true);
    await loadProfile(user.id);
    setIsLoading(false);
  };

  useEffect(() => {
    // supabase auth 상태 변화 구독
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          setTimeout(() => {
            loadProfile(u.id).finally(() => {
              setIsLoading((prev) => (prev ? false : prev));
            });
          }, 0);
        } else {
          setProfile(null);
          setIsLoading((prev) => (prev ? false : prev));
        }
      },
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
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
