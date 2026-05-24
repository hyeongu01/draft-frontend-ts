"use client";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, profile, isLoading } = useUserContext();
  if (isLoading) return <>로딩중</>;
  if (!user) return redirect("/login");
  else if (!profile) return redirect("/onboarding");

  return (
    <main className="min-h-screen flex flex-col items-center">
      {user?.email}
    </main>
  );
}
