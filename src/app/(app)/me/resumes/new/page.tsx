"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createResume } from "@/lib/api/resumes";

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return setError("제목을 입력해주세요");
    setPending(true);
    setError(null);
    try {
      const { id } = await createResume(trimmed);
      router.push(`/me/resumes/${id}/edit`);
    } catch {
      setPending(false);
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
        어떤 시기의 이력서인가요? 회사명이나 직무로 짧게 적어주세요.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            제목
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 스타트업 시니어 디자이너 (2024–현재)"
            required
            autoFocus
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "만드는 중..." : "만들기"}
        </button>
      </form>
    </div>
  );
}
