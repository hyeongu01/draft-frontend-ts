"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateResumeState = { error: string } | null;

export async function createResume(
  _prevState: CreateResumeState,
  formData: FormData,
): Promise<CreateResumeState> {
  const title = (formData.get("title") as string)?.trim();

  if (!title) return { error: "제목을 입력해주세요" };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      content: {},
      is_public: false,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/me");
  redirect(`/me/resumes/${data.id}/edit`);
}

// src/actions/resume.ts (이어서)
export async function updateResume(
  id: string,
  updates: {
    title?: string;
    description?: string;
    is_public?: boolean;
    content?: any;
    experience_years?: number;
  },
) {
  if (
    updates.experience_years !== undefined &&
    (updates.experience_years < 0 || updates.experience_years > 100)
  ) {
    return { error: "연차는 0~100 사이여야 합니다" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("resumes").update(updates).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath(`/me/resumes/${id}/edit`);
}

export async function deleteResume(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  redirect("/me");
}
