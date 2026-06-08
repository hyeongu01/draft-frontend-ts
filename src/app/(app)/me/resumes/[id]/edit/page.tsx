"use client";
// 이력서 편집 — CSR. 소유자 전용 데이터라 클라이언트에서 인증 fetch.
import { Suspense, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditResumeForm from "./EditResumeForm";
import { useResumesControllerFindOne } from "@/lib/api/generated/resumes-private/resumes-private";
import { useUserContext } from "@/context/AuthContext";

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

function EditResumeLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useUserContext();
  const router = useRouter();

  // GET /me/resumes/{id} (소유자 전용). 로그인 확정 후에만 조회.
  const {
    data: resume,
    isLoading,
    isError,
  } = useResumesControllerFindOne(id, {
    query: { enabled: !!user, retry: false },
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">
        <p>이력서를 찾을 수 없어요.</p>
      </div>
    );
  }

  if (authLoading || isLoading || !resume) return <EditSkeleton />;

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
