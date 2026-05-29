import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResumeCard from "@/components/resume/ResumeCard";

type Tab = "resumes" | "saved" | "liked";

const TABS: { key: Tab; label: string }[] = [
  { key: "resumes", label: "내 이력서" },
  { key: "saved", label: "보관함" },
  { key: "liked", label: "좋아요" },
];

export default function MePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader />
      </Suspense>

      <Suspense fallback={<TabsSkeleton />}>
        <TabsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// searchParams await는 Suspense 안에서 (Next 16 blocking-route 회피)
async function TabsSection({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: Tab =
    tab === "saved" || tab === "liked" ? tab : "resumes";

  return (
    <>
      <nav className="flex gap-1 border-b mb-6">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.key === "resumes" ? "/me" : `/me?tab=${t.key}`}
              className={`px-3 py-2.5 text-sm -mb-px border-b-2 ${
                isActive
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <Suspense key={active} fallback={<ListSkeleton />}>
        <TabContent tab={active} />
      </Suspense>
    </>
  );
}

function TabsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 border-b mb-6 flex gap-4">
        <div className="h-4 w-16 bg-gray-100 rounded mt-2.5" />
        <div className="h-4 w-16 bg-gray-100 rounded mt-2.5" />
        <div className="h-4 w-16 bg-gray-100 rounded mt-2.5" />
      </div>
      <ListSkeleton />
    </div>
  );
}

async function ProfileHeader() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .single();

  const nickname = profile?.nickname ?? "사용자";
  const initial = nickname[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 text-xl font-semibold flex items-center justify-center">
        {initial}
      </div>
      <div className="flex-1">
        <div className="text-lg font-medium">{nickname}</div>
        {/* 직무·연차는 탐색 작업에서 컬럼 추가 후 노출 */}
      </div>
      <Link
        href="/me/resumes/new"
        className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90"
      >
        + 새 이력서
      </Link>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 mb-6 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-100" />
      <div className="flex-1">
        <div className="h-5 w-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

async function TabContent({ tab }: { tab: Tab }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  if (tab === "resumes") {
    const [{ data: resumes }, { data: profile }] = await Promise.all([
      supabase
        .from("resumes")
        .select(
          "id, title, description, job_role, experience_years, is_public, like_count, save_count, view_count",
        )
        .order("updated_at", { ascending: false }),
      supabase.from("profiles").select("nickname").eq("id", userId).single(),
    ]);

    if (!resumes?.length) {
      return (
        <Empty
          title="아직 작성한 이력서가 없어요"
          sub='위 "+ 새 이력서" 버튼으로 시작해보세요'
        />
      );
    }

    const nickname = profile?.nickname ?? "익명";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resumes.map((r) => (
          <ResumeCard
            key={r.id}
            href={`/me/resumes/${r.id}/edit`}
            title={r.title}
            description={r.description}
            jobRole={r.job_role}
            experienceYears={r.experience_years}
            nickname={nickname}
            likeCount={r.like_count}
            saveCount={r.save_count}
            viewCount={r.view_count}
            isPublic={r.is_public}
          />
        ))}
      </div>
    );
  }

  // saved / liked — 내 bookmarks·likes에서 이력서 임베딩 (RLS상 공개 이력서만 노출)
  const table = tab === "saved" ? "bookmarks" : "likes";
  const { data: rows } = await supabase
    .from(table)
    .select(
      "created_at, resumes(id, title, description, job_role, experience_years, user_id, like_count, save_count, view_count)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const resumes = (rows ?? [])
    .map((row) => row.resumes)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (!resumes.length) {
    return tab === "saved" ? (
      <Empty title="보관한 이력서가 없어요" sub="피드에서 🔖로 보관해보세요" />
    ) : (
      <Empty title="좋아요한 이력서가 없어요" sub="피드에서 ♥로 표현해보세요" />
    );
  }

  // 작성자 닉네임 한 번에 조회
  const authorIds = [...new Set(resumes.map((r) => r.user_id))];
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", authorIds);
  const nicknameById = new Map((authors ?? []).map((a) => [a.id, a.nickname]));

  return (
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
  );
}

function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border border-dashed rounded-lg p-12 text-center text-gray-500">
      <p className="mb-2">{title}</p>
      <p className="text-sm">{sub}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-2 animate-pulse">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-[58px] border rounded-md bg-gray-50" />
      ))}
    </ul>
  );
}
