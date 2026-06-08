"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useResumesControllerCreateItem } from "@/lib/api/generated/resumes/resumes";
import { EMPTY_DOC } from "@/types/resume";

export default function Page() {
  const router = useRouter();
  const { mutateAsync, isPending } = useResumesControllerCreateItem();
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    try {
      // 빈 초안으로 생성 — 제목·본문은 에디터에서 채운다. 생성 직후엔 비공개.
      const created = await mutateAsync({
        data: { title: "", description: "", content: EMPTY_DOC },
      });
      router.push(`/me/resumes/${created.id}/edit`);
    } catch {
      setError("이력서를 만들지 못했어요. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Link href="/me" className="text-sm text-gray-500 hover:underline">
        ← 내 이력서로
      </Link>

      <h1 className="text-2xl font-medium mt-6 mb-2">새 이력서</h1>
      <p className="text-sm text-gray-500 mb-6">
        빈 이력서를 만들고, 에디터에서 제목과 내용을 채워보세요. 생성 직후에는
        비공개 상태예요.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        type="button"
        onClick={onCreate}
        disabled={isPending}
        className="w-full px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "만드는 중..." : "빈 이력서 만들기"}
      </button>
    </div>
  );
}
