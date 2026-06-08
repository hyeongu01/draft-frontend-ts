// src/components/resume/ResumeCard.tsx
import Link from "next/link";
import { formatExperience } from "@/types/resume";

type Props = {
  href: string;
  title: string;
  description?: string | null;
  jobRole?: string | null;
  experienceYears: number;
  nickname: string;
  likeCount: number;
  scrapCount: number;
  viewCount: number;
  // 제공 시 공개/비공개 배지 표시 (마이페이지 전용)
  isPublic?: boolean;
};

export default function ResumeCard({
  href,
  title,
  description,
  jobRole,
  experienceYears,
  nickname,
  likeCount,
  scrapCount,
  viewCount,
  isPublic,
}: Props) {
  // 한 줄 설명만 — 비어있으면 표시 안 함
  const summary = description?.trim();

  return (
    <Link
      href={href}
      prefetch={false}
      className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{nickname}</span>
        {jobRole && (
          <>
            <span aria-hidden>·</span>
            <span>{jobRole}</span>
          </>
        )}
        <span aria-hidden>·</span>
        <span>{formatExperience(experienceYears)}</span>
        {isPublic !== undefined && (
          <span
            className={`ml-auto px-2 py-0.5 rounded-full text-[11px] ${
              isPublic
                ? "bg-emerald-50 text-emerald-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {isPublic ? "공개" : "비공개"}
          </span>
        )}
      </div>
      <h2 className="text-sm font-medium mb-1.5 leading-snug">{title}</h2>
      {summary && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {summary}
        </p>
      )}
      <div className="flex gap-3 text-xs text-gray-400">
        <span>♥ {likeCount}</span>
        <span>🔖 {scrapCount}</span>
        <span>👁 {viewCount}</span>
      </div>
    </Link>
  );
}
