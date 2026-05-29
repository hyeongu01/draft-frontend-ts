// src/app/(app)/me/resumes/[id]/edit/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditResumeForm from "./EditResumeForm";

export default function EditResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditResumeLoader params={params} />
    </Suspense>
  );
}

async function EditResumeLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 이력서 조회 + 로그인 확인(로컬 JWT) 병렬
  const [{ data: resume }, { data: claims }] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", id).single(),
    supabase.auth.getClaims(),
  ]);
  if (!claims?.claims?.sub) redirect("/login");

  if (!resume) notFound();

  return <EditResumeForm resume={resume} />;
}

function EditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 animate-pulse">
      <div className="h-4 w-24 bg-gray-100 rounded mb-6" />
      <div className="h-10 w-full bg-gray-100 rounded mb-6" />
      <div className="h-40 w-full bg-gray-100 rounded" />
    </div>
  );
}
