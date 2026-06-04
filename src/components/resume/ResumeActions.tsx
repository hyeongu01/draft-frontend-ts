// src/components/resume/ResumeActions.tsx
"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Heart, Bookmark } from "lucide-react";
import { setLike, setBookmark, getResumeState } from "@/lib/api/resumes";
import { useUserContext } from "@/context/AuthContext";

type Props = {
  resumeId: string;
  likeCount: number;
  saveCount: number;
};

const toggleReducer = (
  state: { on: boolean; count: number },
  next: boolean,
) => ({ on: next, count: state.count + (next ? 1 : -1) });

export default function ResumeActions({
  resumeId,
  likeCount,
  saveCount,
}: Props) {
  const { user } = useUserContext();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // 인증 사용자라면 내 좋아요·보관 상태를 조회 (비로그인은 false 유지)
  useEffect(() => {
    if (!user) return;
    getResumeState(resumeId)
      .then((s) => {
        setLiked(s.liked);
        setBookmarked(s.bookmarked);
      })
      .catch(() => {});
  }, [user, resumeId]);

  const [like, applyLike] = useOptimistic(
    { on: liked, count: likeCount },
    toggleReducer,
  );
  const [bookmark, applyBookmark] = useOptimistic(
    { on: bookmarked, count: saveCount },
    toggleReducer,
  );
  const [isPending, startTransition] = useTransition();

  const onLike = () => {
    const next = !like.on;
    startTransition(async () => {
      applyLike(next);
      try {
        await setLike(resumeId, next);
        setLiked(next);
      } catch {
        /* 실패 시 다음 렌더에서 서버 상태로 복원 */
      }
    });
  };

  const onBookmark = () => {
    const next = !bookmark.on;
    startTransition(async () => {
      applyBookmark(next);
      try {
        await setBookmark(resumeId, next);
        setBookmarked(next);
      } catch {
        /* noop */
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onLike}
        disabled={isPending}
        aria-pressed={like.on}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors disabled:opacity-60 ${
          like.on
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Heart className="w-4 h-4" fill={like.on ? "currentColor" : "none"} />
        {like.count}
      </button>

      <button
        type="button"
        onClick={onBookmark}
        disabled={isPending}
        aria-pressed={bookmark.on}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors disabled:opacity-60 ${
          bookmark.on
            ? "border-amber-200 bg-amber-50 text-amber-600"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Bookmark
          className="w-4 h-4"
          fill={bookmark.on ? "currentColor" : "none"}
        />
        {bookmark.count}
      </button>
    </div>
  );
}
