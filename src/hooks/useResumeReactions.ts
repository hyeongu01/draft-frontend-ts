"use client";

// 좋아요·스크랩 토글 공용 훅 (공개 상세 ResumeActions, 피드 카드 ResumeCardReactions에서 사용).
//
// - 초기 on/off: 로그인 시에만 GET /users/me/likes·/scraps(id 목록) 쿼리를 켜서 대조.
//   비로그인은 enabled:false → 불필요한 401을 만들지 않는다.
// - 카운트: SSR(공개 응답)로 받은 likeCount/scrapCount에서 시작, 토글 응답으로 최종 동기화.
// - 토글: 낙관적 업데이트 — id 목록 쿼리 캐시(setQueryData)와 카운트를 즉시 반영,
//   실패 시 스냅샷으로 롤백 + 목록 invalidate로 서버 상태 재동기화.
// - 비로그인 클릭: /login 으로 이동.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/AuthContext";
import {
  useUsersControllerGetLikeIds,
  useUsersControllerGetScrapIds,
  getUsersControllerGetLikeIdsQueryKey,
  getUsersControllerGetScrapIdsQueryKey,
} from "@/lib/api/generated/users/users";
import {
  useResumeReactionsControllerToggleLike,
  useResumeReactionsControllerToggleScrap,
} from "@/lib/api/generated/like/like";
import type { IdsResponseType } from "@/lib/api/generated/model";

// 같은 화면에 카드가 여러 장이어도 id 목록 요청은 한 번만 나가도록 잠깐 fresh 유지.
const IDS_STALE_TIME = 1000 * 30;

export type ReactionState = {
  on: boolean;
  count: number;
  pending: boolean;
  toggle: () => void;
};

export function useResumeReactions(
  resumeId: string,
  initial: { likeCount: number; scrapCount: number },
): { like: ReactionState; scrap: ReactionState } {
  const { user, isLoading: isAuthLoading } = useUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const likeIdsKey = getUsersControllerGetLikeIdsQueryKey();
  const scrapIdsKey = getUsersControllerGetScrapIdsQueryKey();

  const { data: likeIds } = useUsersControllerGetLikeIds({
    query: { enabled: !!user, staleTime: IDS_STALE_TIME },
  });
  const { data: scrapIds } = useUsersControllerGetScrapIds({
    query: { enabled: !!user, staleTime: IDS_STALE_TIME },
  });

  const [likeCount, setLikeCount] = useState(initial.likeCount);
  const [scrapCount, setScrapCount] = useState(initial.scrapCount);

  const isLiked = !!likeIds?.ids.includes(resumeId);
  const isScrapped = !!scrapIds?.ids.includes(resumeId);

  // ── id 목록 캐시 헬퍼 ──────────────────────────────────────
  const setIds = (
    key: readonly unknown[],
    update: (ids: string[]) => string[],
  ) =>
    queryClient.setQueryData<IdsResponseType>(key, (prev) => ({
      ids: update(prev?.ids ?? []),
    }));
  const withId = (ids: string[]) =>
    ids.includes(resumeId) ? ids : [...ids, resumeId];
  const withoutId = (ids: string[]) => ids.filter((x) => x !== resumeId);

  const likeMutation = useResumeReactionsControllerToggleLike({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: likeIdsKey });
        const prevIds = queryClient.getQueryData<IdsResponseType>(likeIdsKey);
        const prevCount = likeCount;
        const next = !isLiked;
        setIds(likeIdsKey, next ? withId : withoutId);
        setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
        return { prevIds, prevCount };
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;
        queryClient.setQueryData(likeIdsKey, ctx.prevIds ?? { ids: [] });
        setLikeCount(ctx.prevCount);
        // 롤백 스냅샷이 서버와 어긋났을 수 있으니 재동기화
        queryClient.invalidateQueries({ queryKey: likeIdsKey });
      },
      onSuccess: (data) => {
        // 토글 응답이 최종 상태 — 카운트·id 목록 캐시를 서버 기준으로 확정
        setLikeCount(data.likeCount);
        setIds(likeIdsKey, data.isLiked ? withId : withoutId);
      },
    },
  });

  const scrapMutation = useResumeReactionsControllerToggleScrap({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: scrapIdsKey });
        const prevIds = queryClient.getQueryData<IdsResponseType>(scrapIdsKey);
        const prevCount = scrapCount;
        const next = !isScrapped;
        setIds(scrapIdsKey, next ? withId : withoutId);
        setScrapCount((c) => Math.max(0, c + (next ? 1 : -1)));
        return { prevIds, prevCount };
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;
        queryClient.setQueryData(scrapIdsKey, ctx.prevIds ?? { ids: [] });
        setScrapCount(ctx.prevCount);
        queryClient.invalidateQueries({ queryKey: scrapIdsKey });
      },
      onSuccess: (data) => {
        setScrapCount(data.scrapCount);
        setIds(scrapIdsKey, data.isScrapped ? withId : withoutId);
      },
    },
  });

  // 비로그인 → 로그인 화면으로 유도 (인증 확인 중에는 무시)
  const guard = (run: () => void) => () => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    run();
  };

  return {
    like: {
      on: isLiked,
      count: likeCount,
      pending: likeMutation.isPending,
      toggle: guard(() => {
        if (!likeMutation.isPending) likeMutation.mutate({ id: resumeId });
      }),
    },
    scrap: {
      on: isScrapped,
      count: scrapCount,
      pending: scrapMutation.isPending,
      toggle: guard(() => {
        if (!scrapMutation.isPending) scrapMutation.mutate({ id: resumeId });
      }),
    },
  };
}
