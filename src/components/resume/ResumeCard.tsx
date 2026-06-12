// src/components/resume/ResumeCard.tsx
import Link from "next/link";
import { formatExperience } from "@/types/resume";
import UserAvatar from "@/components/UserAvatar";
import ResumeCardReactions from "./ResumeCardReactions";

type Props = {
  href: string;
  title: string;
  description?: string | null;
  jobRole?: string | null;
  experienceYears: number;
  nickname: string;
  profileImageUrl?: string | null; // 작성자 아바타 (없으면 이니셜 폴백)
  likeCount: number;
  scrapCount: number;
  viewCount?: number; // 백엔드 계약에 아직 없음 — 있을 때만 표시
  // 제공 시 공개/비공개 배지 표시 (마이페이지 전용)
  isPublic?: boolean;
  // 제공 시 좋아요·스크랩이 토글 버튼으로 동작 (공개 피드 전용).
  // 미제공이면 카운트만 표시 (/me 목록 등).
  resumeId?: string;
};

export default function ResumeCard({
  href,
  title,
  description,
  jobRole,
  experienceYears,
  nickname,
  profileImageUrl,
  likeCount,
  scrapCount,
  viewCount,
  isPublic,
  resumeId,
}: Props) {
  // 한 줄 설명만 — 비어있으면 표시 안 함
  const summary = description?.trim();

  return (
    // 카드 전체를 <a>로 감싸면 내부 토글 버튼이 중첩 인터랙티브(invalid HTML)가 됨.
    // → 제목 링크의 after 오버레이로 카드 전체 클릭을 유지하고, 버튼은 z-10으로 위에 띄운다.
    <div className="relative border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
        <UserAvatar
          src={profileImageUrl}
          nickname={nickname}
          className="w-5 h-5 text-[10px]"
        />
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
      <h2 className="text-sm font-medium mb-1.5 leading-snug">
        <Link
          href={href}
          prefetch={false}
          className="after:absolute after:inset-0"
        >
          {title}
        </Link>
      </h2>
      {summary && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {summary}
        </p>
      )}
      <div className="flex gap-3 text-xs text-gray-400">
        {resumeId ? (
          <ResumeCardReactions
            resumeId={resumeId}
            likeCount={likeCount}
            scrapCount={scrapCount}
          />
        ) : (
          <>
            <span>♥ {likeCount}</span>
            <span>🔖 {scrapCount}</span>
          </>
        )}
        {viewCount !== undefined && <span>👁 {viewCount}</span>}
      </div>
    </div>
  );
}
