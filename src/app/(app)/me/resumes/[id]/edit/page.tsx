"use client";
// 이력서 편집 — CSR. 소유자 전용 데이터라 클라이언트에서 인증 fetch.
import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditResumeForm from "./EditResumeForm";
import { getResume } from "@/lib/api/resumes";
import { useUserContext } from "@/context/AuthContext";
import type { Resume } from "@/lib/types";

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
  const { user, isLoading } = useUserContext();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let alive = true;
    getResume(id)
      .then((data) => alive && setResume(data))
      .catch(() => alive && setNotFound(true));
    return () => {
      alive = false;
    };
  }, [id, user, isLoading, router]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">
        <p>이력서를 찾을 수 없어요.</p>
      </div>
    );
  }

  if (!resume) return <EditSkeleton />;

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
