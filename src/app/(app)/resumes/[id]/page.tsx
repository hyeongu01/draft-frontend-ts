// src/app/(app)/resumes/[id]/page.tsx — 공개 이력서 상세 (SSR, 인증 불필요)
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicResume } from "@/lib/api/public";
import { normalizeContent, formatExperience } from "@/types/resume";
import { sectionBodyToHtml } from "@/lib/resume-html";
import ResumeActions from "@/components/resume/ResumeActions";
import OwnerEditLink from "@/components/resume/OwnerEditLink";

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

async function ResumeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resume = await getPublicResume(id);
  if (!resume) notFound();

  const { sections } = normalizeContent(resume.content);
  const renderedSections = sections
    .map((s) => ({ ...s, html: sectionBodyToHtml(s.body) }))
    .filter((s) => s.html !== null);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/" prefetch={false} className="text-sm text-gray-500 hover:underline">
          ← 피드로
        </Link>
        {/* 작성자 본인 판별엔 owner id 필요 — 공개 DTO(PublicUserResponseType)에 user.id 추가되면
            ownerId={resume.user?.id} 전달. 그 전엔 미전달 → 편집 링크 숨김. */}
        <OwnerEditLink resumeId={resume.id} />
      </div>

      <header className="mb-8 pb-6 border-b">
        <h1 className="text-2xl font-medium mb-2">{resume.title}</h1>
        {resume.description && (
          <p className="text-sm text-gray-500 mb-3">{resume.description}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{resume.user?.nickname ?? "익명"}</span>
            {resume.category?.name && (
              <>
                <span aria-hidden>·</span>
                <span>{resume.category.name}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{formatExperience(resume.careerYears ?? 0)}</span>
          </div>
          <ResumeActions
            resumeId={resume.id}
            likeCount={resume.likeCount}
            scrapCount={resume.scrapCount}
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
