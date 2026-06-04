// src/app/(app)/page.tsx — 공개 피드 (SSR, 인증 불필요)
import { Suspense } from "react";
import ResumeCard from "@/components/resume/ResumeCard";
import FilterChips from "@/components/resume/FilterChips";
import { getPublicResumes } from "@/lib/api/public";

type SearchParams = Promise<{ years?: string }>;

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-medium mb-6">홈</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Feed({ searchParams }: { searchParams: SearchParams }) {
  const { years = "" } = await searchParams;

  // 공개 이력서 — 연차 필터는 백엔드 쿼리로 위임. 작성자 닉네임은 응답에 임베딩.
  const resumes = await getPublicResumes(years);

  return (
    <>
      <FilterChips years={years} />
      {!resumes.length ? (
        <div className="border border-dashed rounded-lg p-12 text-center text-gray-500">
          <p className="mb-2">조건에 맞는 이력서가 없어요</p>
          <p className="text-sm">필터를 바꾸거나 첫 이력서를 공개해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              href={`/resumes/${r.id}`}
              title={r.title}
              description={r.description}
              jobRole={r.job_role}
              experienceYears={r.experience_years}
              nickname={r.author?.nickname ?? "익명"}
              likeCount={r.like_count}
              saveCount={r.save_count}
              viewCount={r.view_count}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
          <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-full bg-gray-100 rounded mb-1" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}
