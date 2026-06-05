"use client";
// 마이페이지 — CSR. 인증 필요 (토큰은 메모리, 서버에서 못 읽으므로 클라이언트 fetch).
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ResumeCard from "@/components/resume/ResumeCard";
import { useUserContext } from "@/context/AuthContext";
import {
  getMyResumes,
  getMyBookmarks,
  getMyLikes,
} from "@/lib/api/resumes";
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
  const initial = nickname[0]?.toUpperCase() ?? "U";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 text-xl font-semibold flex items-center justify-center">
          {initial}
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium">{nickname}</div>
        </div>
        <button
          onClick={() => logout()}
          className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50"
        >
          로그아웃
        </button>
        <Link
          href="/me/resumes/new"
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

      <TabContent tab={active} fallbackNickname={nickname} />
    </div>
  );
}

function TabContent({
  tab,
  fallbackNickname,
}: {
  tab: Tab;
  fallbackNickname: string;
}) {
  const [resumes, setResumes] = useState<Resume[] | null>(null);

  useEffect(() => {
    let alive = true;
    setResumes(null);
    const loader =
      tab === "resumes"
        ? getMyResumes
        : tab === "saved"
          ? getMyBookmarks
          : getMyLikes;
    loader()
      .then((data) => alive && setResumes(data))
      .catch(() => alive && setResumes([]));
    return () => {
      alive = false;
    };
  }, [tab]);

  if (resumes === null) return <ListSkeleton />;

  if (!resumes.length) {
    if (tab === "resumes")
      return (
        <Empty
          title="아직 작성한 이력서가 없어요"
          sub='위 "+ 새 이력서" 버튼으로 시작해보세요'
        />
      );
    if (tab === "saved")
      return <Empty title="보관한 이력서가 없어요" sub="피드에서 🔖로 보관해보세요" />;
    return <Empty title="좋아요한 이력서가 없어요" sub="피드에서 ♥로 표현해보세요" />;
  }

  const ownTab = tab === "resumes";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {resumes.map((r) => (
        <ResumeCard
          key={r.id}
          href={ownTab ? `/me/resumes/${r.id}/edit` : `/resumes/${r.id}`}
          title={r.title}
          description={r.description}
          jobRole={r.jobRole}
          experienceYears={r.experienceYears}
          nickname={ownTab ? fallbackNickname : r.author?.nickname ?? "익명"}
          likeCount={r.likeCount}
          saveCount={r.saveCount}
          viewCount={r.viewCount}
          isPublic={ownTab ? r.isPublic : undefined}
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
