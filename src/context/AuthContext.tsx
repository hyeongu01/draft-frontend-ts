"use client";
import { createContext, useState, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  login: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvier({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const login = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  return (
    <UserContext.Provider value={{ user, login }}>
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
