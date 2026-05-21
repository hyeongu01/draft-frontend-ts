"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();

  const googleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Button onClick={googleLogin}>Google 로그인</Button>
    </main>
  );
}
