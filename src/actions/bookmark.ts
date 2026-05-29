"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 보관 토글 — 현재 상태를 DB에서 확인해 insert/delete (멱등).
// save_count는 bookmarks 트리거(security definer)가 갱신.
export async function toggleBookmark(resumeId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "unauthorized" };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("resume_id", resumeId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: userId, resume_id: resumeId });
    if (error) return { error: error.message };
  }

  revalidatePath(`/resumes/${resumeId}`);
  revalidatePath("/");
}
