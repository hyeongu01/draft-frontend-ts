"use client";
// 마이페이지 — CSR. 인증 필요 (토큰은 메모리, 서버에서 못 읽으므로 클라이언트 fetch).
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ResumeCard from "@/components/resume/ResumeCard";
import UserAvatar from "@/components/UserAvatar";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useUserContext } from "@/context/AuthContext";
import { getMyBookmarks, getMyLikes } from "@/lib/api/resumes";
import { useResumesControllerFindAll } from "@/lib/api/generated/resumes-private/resumes-private";
import { useCategories } from "@/hooks/useCategories";
import type { Resume } from "@/lib/types";

type Tab = "resumes" | "saved" | "liked";

const TABS: { key: Tab; label: string }[] = [
  { key: "resumes", label: "내 이력서" },
  { key: "saved", label: "보관함" },
  { key: "liked", label: "좋아요" },
];

export default function MePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-6">
          <ProfileHeaderSkeleton />
          <ListSkeleton />
        </div>
      }
    >
      <MeContent />
    </Suspense>
  );
}

function MeContent() {
  const { user, profile, isLoading, logout } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const active: Tab =
    tabParam === "saved" || tabParam === "liked" ? tabParam : "resumes";

  // 비로그인 가드 (미들웨어 제거 → 클라이언트에서 보호)
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ProfileHeaderSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  const nickname = profile?.nickname ?? "사용자";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar
          src={profile?.profileImageUrl}
          nickname={nickname}
          className="w-14 h-14 text-xl"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">{nickname}</div>
            <EditProfileDialog />
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50"
        >
          로그아웃
        </button>
        <Link
          href="/me/resumes/new"
          prefetch={false}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90"
        >
          + 새 이력서
        </Link>
      </div>

      <nav className="flex gap-1 border-b mb-6">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              prefetch={false}
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

      <TabContent
        tab={active}
        fallbackNickname={nickname}
        fallbackProfileImageUrl={profile?.profileImageUrl ?? null}
      />
    </div>
  );
}

function TabContent({
  tab,
  fallbackNickname,
  fallbackProfileImageUrl,
}: {
  tab: Tab;
  fallbackNickname: string;
  fallbackProfileImageUrl: string | null;
}) {
  // "내 이력서"는 실 엔드포인트(GET /me/resumes), saved/liked는 아직 mock.
  if (tab === "resumes")
    return (
      <OwnResumesTab
        fallbackNickname={fallbackNickname}
        fallbackProfileImageUrl={fallbackProfileImageUrl}
      />
    );
  return <MockListTab tab={tab} />;
}

// 내 이력서 — GET /me/resumes (소유자 전용). 직무는 categoryId→이름 룩업.
function OwnResumesTab({
  fallbackNickname,
  fallbackProfileImageUrl,
}: {
  fallbackNickname: string;
  fallbackProfileImageUrl: string | null;
}) {
  const { data, isLoading, isError } = useResumesControllerFindAll({
    limit: 50,
  });
  const { nameById } = useCategories();

  if (isLoading) return <ListSkeleton />;

  const items = data?.items ?? [];
  if (isError || !items.length)
    return (
      <Empty
        title="아직 작성한 이력서가 없어요"
        sub='위 "+ 새 이력서" 버튼으로 시작해보세요'
      />
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((r) => (
        <ResumeCard
          key={r.id}
          href={`/me/resumes/${r.id}/edit`}
          title={r.title}
          description={r.description}
          jobRole={r.category?.id != null ? nameById.get(r.category.id) ?? null : null}
          experienceYears={r.careerYears ?? 0}
          nickname={fallbackNickname}
          profileImageUrl={fallbackProfileImageUrl}
          likeCount={r.likeCount}
          scrapCount={r.scrapCount}
          isPublic={r.isPublic}
          // viewCount 미존재(계약) → 표시 생략
        />
      ))}
    </div>
  );
}

// 보관함/좋아요 — 계약 미정, mock 유지.
function MockListTab({ tab }: { tab: "saved" | "liked" }) {
  const [resumes, setResumes] = useState<Resume[] | null>(null);

  useEffect(() => {
    let alive = true;
    setResumes(null);
    const loader = tab === "saved" ? getMyBookmarks : getMyLikes;
    loader()
      .then((data) => alive && setResumes(data))
      .catch(() => alive && setResumes([]));
    return () => {
      alive = false;
    };
  }, [tab]);

  if (resumes === null) return <ListSkeleton />;

  if (!resumes.length)
    return tab === "saved" ? (
      <Empty title="보관한 이력서가 없어요" sub="피드에서 🔖로 보관해보세요" />
    ) : (
      <Empty title="좋아요한 이력서가 없어요" sub="피드에서 ♥로 표현해보세요" />
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {resumes.map((r) => (
        <ResumeCard
          key={r.id}
          href={`/resumes/${r.id}`}
          title={r.title}
          description={r.description}
          jobRole={r.jobRole}
          experienceYears={r.experienceYears}
          nickname={r.author?.nickname ?? "익명"}
          profileImageUrl={r.author?.profileImageUrl}
          likeCount={r.likeCount}
          scrapCount={r.scrapCount}
          viewCount={r.viewCount}
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

function ListSkeleton() {
  return (
    <ul className="space-y-2 animate-pulse">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-[58px] border rounded-md bg-gray-50" />
      ))}
    </ul>
  );
}
