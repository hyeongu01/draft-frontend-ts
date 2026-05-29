// src/app/(app)/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResumeCard from "@/components/resume/ResumeCard";
import FilterChips, { YEAR_FILTERS } from "@/components/resume/FilterChips";

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 온보딩 미완료(프로필 없음) → 닉네임 설정으로
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();
  if (!profile?.nickname) redirect("/onboarding");

  // 공개 이력서 + 연차 필터 적용 (RLS가 is_public = true 읽기 허용)
  let query = supabase
    .from("resumes")
    .select(
      "id, title, description, job_role, user_id, experience_years, like_count, save_count, view_count",
    )
    .eq("is_public", true);

  const yearFilter = YEAR_FILTERS.find((y) => y.key === years && y.key !== "");
  if (yearFilter) {
    query = query.gte("experience_years", yearFilter.min);
    if (yearFilter.max !== null) {
      query = query.lte("experience_years", yearFilter.max);
    }
  }

  const { data: resumes } = await query.order("updated_at", {
    ascending: false,
  });

  // 작성자 닉네임을 user_id 묶어서 한 번에 조회
  const authorIds = [...new Set((resumes ?? []).map((r) => r.user_id))];
  const { data: authors } = authorIds.length
    ? await supabase.from("profiles").select("id, nickname").in("id", authorIds)
    : { data: [] };
  const nicknameById = new Map(
    (authors ?? []).map((a) => [a.id, a.nickname]),
  );

  return (
    <>
      <FilterChips years={years} />
      {!resumes?.length ? (
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
              nickname={nicknameById.get(r.user_id) ?? "익명"}
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
