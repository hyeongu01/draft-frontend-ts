// src/app/(app)/page.tsx — 공개 피드 (SSR, 인증 불필요)
import { Suspense } from "react";
import ResumeCard from "@/components/resume/ResumeCard";
import FilterChips, { YEAR_FILTERS } from "@/components/resume/FilterChips";
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

  // years 칩(키) → 백엔드 careerYears 범위 쿼리로 매핑. "전체"는 필터 미적용.
  const filter = YEAR_FILTERS.find((y) => y.key === years) ?? YEAR_FILTERS[0];
  const resumes = await getPublicResumes(
    filter.key
      ? {
          minCareerYear: filter.min,
          ...(filter.max != null ? { maxCareerYear: filter.max } : {}),
        }
      : {},
  );

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
              resumeId={r.id} // 좋아요·스크랩 토글 활성화
              href={`/resumes/${r.id}`}
              title={r.title}
              description={r.description}
              jobRole={r.category?.name ?? null}
              experienceYears={r.careerYears ?? 0}
              nickname={r.user?.nickname ?? "익명"}
              profileImageUrl={r.user?.profileImageUrl}
              likeCount={r.likeCount}
              scrapCount={r.scrapCount}
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
