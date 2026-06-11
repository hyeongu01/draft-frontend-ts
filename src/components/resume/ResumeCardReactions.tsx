// src/components/resume/ResumeCardReactions.tsx — 피드 카드의 좋아요·스크랩 토글
// ResumeCard의 오버레이 링크 위에 떠야 하므로 relative z-10 필수.
"use client";

import { Heart, Bookmark } from "lucide-react";
import { useResumeReactions } from "@/hooks/useResumeReactions";

type Props = {
  resumeId: string;
  likeCount: number; // SSR 공개 응답의 카운트 (초기값)
  scrapCount: number;
};

export default function ResumeCardReactions({
  resumeId,
  likeCount,
  scrapCount,
}: Props) {
  const { like, scrap } = useResumeReactions(resumeId, {
    likeCount,
    scrapCount,
  });

  return (
    <>
      <button
        type="button"
        onClick={like.toggle}
        disabled={like.pending}
        aria-pressed={like.on}
        aria-label="좋아요"
        className={`relative z-10 flex items-center gap-1 transition-colors disabled:opacity-60 ${
          like.on ? "text-red-500" : "text-gray-400 hover:text-red-500"
        }`}
      >
        <Heart
          className="w-3.5 h-3.5"
          fill={like.on ? "currentColor" : "none"}
        />
        {like.count}
      </button>

      <button
        type="button"
        onClick={scrap.toggle}
        disabled={scrap.pending}
        aria-pressed={scrap.on}
        aria-label="스크랩"
        className={`relative z-10 flex items-center gap-1 transition-colors disabled:opacity-60 ${
          scrap.on ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
        }`}
      >
        <Bookmark
          className="w-3.5 h-3.5"
          fill={scrap.on ? "currentColor" : "none"}
        />
        {scrap.count}
      </button>
    </>
  );
}
