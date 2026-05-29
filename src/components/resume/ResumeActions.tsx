// src/components/resume/ResumeActions.tsx
"use client";

import { useOptimistic, useTransition } from "react";
import { Heart, Bookmark } from "lucide-react";
import { toggleLike } from "@/actions/like";
import { toggleBookmark } from "@/actions/bookmark";

type Props = {
  resumeId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likeCount: number;
  saveCount: number;
};

const toggleReducer = (
  state: { on: boolean; count: number },
  next: boolean,
) => ({ on: next, count: state.count + (next ? 1 : -1) });

export default function ResumeActions({
  resumeId,
  initialLiked,
  initialBookmarked,
  likeCount,
  saveCount,
}: Props) {
  const [like, setLike] = useOptimistic(
    { on: initialLiked, count: likeCount },
    toggleReducer,
  );
  const [bookmark, setBookmark] = useOptimistic(
    { on: initialBookmarked, count: saveCount },
    toggleReducer,
  );
  const [isPending, startTransition] = useTransition();

  const onLike = () => {
    startTransition(async () => {
      setLike(!like.on);
      await toggleLike(resumeId);
    });
  };

  const onBookmark = () => {
    startTransition(async () => {
      setBookmark(!bookmark.on);
      await toggleBookmark(resumeId);
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
