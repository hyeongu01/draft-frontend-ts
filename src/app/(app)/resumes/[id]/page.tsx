// src/app/(app)/resumes/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizeContent, formatExperience } from "@/types/resume";
import { sectionBodyToHtml } from "@/lib/resume-html";
import ResumeActions from "@/components/resume/ResumeActions";

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Suspense fallback={<ResumeDetailSkeleton />}>
        <ResumeDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ResumeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS: 공개 이력서이거나 본인 소유면 row 반환, 아니면 null
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (!resume) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === resume.user_id;

  // 조회수 증가 — 본인 조회는 제외 (RPC가 공개 이력서만 +1)
  if (!isOwner) {
    await supabase.rpc("increment_view_count", { p_resume_id: resume.id });
  }

  // 작성자 닉네임 (resumes↔profiles 관계가 없어 별도 조회)
  const { data: author } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", resume.user_id)
    .single();

  // 현재 유저의 좋아요·보관 여부 (RLS상 본인 row만 조회됨)
  let liked = false;
  let bookmarked = false;
  if (user) {
    const [{ data: myLike }, { data: myBookmark }] = await Promise.all([
      supabase
        .from("likes")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("resume_id", resume.id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("resume_id", resume.id)
        .maybeSingle(),
    ]);
    liked = !!myLike;
    bookmarked = !!myBookmark;
  }

  const { sections } = normalizeContent(resume.content);
  const renderedSections = sections
    .map((s) => ({ ...s, html: sectionBodyToHtml(s.body) }))
    .filter((s) => s.html !== null);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← 피드로
        </Link>
        {isOwner && (
          <Link
            href={`/me/resumes/${resume.id}/edit`}
            className="text-sm text-gray-500 hover:underline"
          >
            편집 →
          </Link>
        )}
      </div>

      <header className="mb-8 pb-6 border-b">
        <h1 className="text-2xl font-medium mb-2">{resume.title}</h1>
        {resume.description && (
          <p className="text-sm text-gray-500 mb-3">{resume.description}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{author?.nickname ?? "익명"}</span>
            {resume.job_role && (
              <>
                <span aria-hidden>·</span>
                <span>{resume.job_role}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{formatExperience(resume.experience_years)}</span>
          </div>
          <ResumeActions
            resumeId={resume.id}
            initialLiked={liked}
            initialBookmarked={bookmarked}
            likeCount={resume.like_count}
            saveCount={resume.save_count}
          />
        </div>
      </header>

      {renderedSections.length === 0 ? (
        <p className="text-sm text-gray-400">아직 작성된 내용이 없어요.</p>
      ) : (
        <div className="space-y-8">
          {renderedSections.map((section) => (
            <section key={section.id}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">
                {section.title}
              </h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section.html! }}
              />
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function ResumeDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-20 bg-gray-100 rounded mb-6" />
      <div className="h-7 w-2/3 bg-gray-100 rounded mb-3" />
      <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 rounded" />
        <div className="h-4 w-4/6 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
