"use client";

import { useMemo } from "react";
import { useCategoriesControllerGetAllCategories } from "@/lib/api/generated/categories/categories";

// 카테고리(직무 분류)는 수가 적고 고정적 → 한 번 받아 길게 캐시하고
// id→name 룩업을 제공한다. 이력서는 categoryId만 들고 다니므로(임베드 X),
// 표시 시점에 이 맵으로 이름을 해석한다.
export function useCategories() {
  const { data, isLoading } = useCategoriesControllerGetAllCategories(
    { limit: 100 }, // 카테고리 전수 조회 (limit 최대 100)
    { query: { staleTime: 1000 * 60 * 60 } }, // 1시간 캐시
  );

  const categories = useMemo(() => data?.items ?? [], [data?.items]);

  const nameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  return { categories, nameById, isLoading };
}
