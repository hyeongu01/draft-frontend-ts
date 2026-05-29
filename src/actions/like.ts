"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 좋아요 토글 — 현재 상태를 DB에서 확인해 insert/delete (멱등).
// like_count는 likes 트리거(security definer)가 갱신.
export async function toggleLike(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("resume_id", resumeId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("resume_id", resumeId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: user.id, resume_id: resumeId });
    if (error) return { error: error.message };
  }

  revalidatePath(`/resumes/${resumeId}`);
  revalidatePath("/");
}
