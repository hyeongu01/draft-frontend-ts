// src/components/layout/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";

const TABS: { label: string; href: string; soon?: boolean }[] = [
  { label: "피드", href: "/" },
  { label: "탐색", href: "/explore", soon: true },
  { label: "채팅", href: "/chats", soon: true },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { profile } = useUserContext();
  const initial = profile?.nickname?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            drafted
          </Link>
          <nav className="flex items-center gap-5 text-[13px]">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              if (tab.soon) {
                return (
                  <span
                    key={tab.href}
                    title="준비 중"
                    className="text-gray-300 cursor-not-allowed"
                  >
                    {tab.label}
                  </span>
                );
              }
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    active
                      ? "text-gray-900 font-medium border-b-[1.5px] border-gray-900 pb-0.5"
                      : "text-gray-500 hover:text-gray-900"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/me"
            aria-label="마이페이지"
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center hover:bg-gray-200"
          >
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}
