// src/components/resume/FilterChips.tsx
import Link from "next/link";

export const YEAR_FILTERS = [
  { key: "", label: "전체", min: 0, max: null },
  { key: "junior", label: "0-3년", min: 0, max: 3 },
  { key: "mid", label: "4-6년", min: 4, max: 6 },
  { key: "senior", label: "7년+", min: 7, max: null },
] as const;

export type YearKey = (typeof YEAR_FILTERS)[number]["key"];

export default function FilterChips({ years }: { years: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {YEAR_FILTERS.map((y) => {
        const href = y.key ? `/?years=${y.key}` : "/";
        const active = years === y.key;
        return (
          <Link
            key={y.key || "all"}
            prefetch={false}
            href={href}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              active
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {y.label}
          </Link>
        );
      })}
    </div>
  );
}
