"use client";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const { user } = useUserContext();

  return (
    <main className="min-h-screen flex flex-col items-center">
      {user?.email}
    </main>
  );
}
