// src/app/(app)/layout.tsx — 네비바 있는 메인 앱 공통 레이아웃
import { Suspense } from "react";
import AppHeader from "@/components/layout/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* usePathname(동적)을 쓰는 헤더를 Suspense로 격리 → 본문 prerender 가능 */}
      <Suspense fallback={<HeaderFallback />}>
        <AppHeader />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
        <span className="text-[15px] font-semibold tracking-tight">
          drafted
        </span>
      </div>
    </header>
  );
}
