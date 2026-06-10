"use client";
// 공개 상세 페이지(SSR)는 현재 유저를 모르므로, 소유자 편집 링크는 클라이언트에서 판단.
import Link from "next/link";
import { useUserContext } from "@/context/AuthContext";

export default function OwnerEditLink({
  resumeId,
  ownerId,
}: {
  resumeId: string;
  ownerId: string;
}) {
  const { user } = useUserContext();
  if (user?.id !== ownerId) return null;
  return (
    <Link
      href={`/me/resumes/${resumeId}/edit`}
      prefetch={false}
      className="text-sm text-gray-500 hover:underline"
    >
      편집 →
    </Link>
  );
}
