"use client";
import { useUserContext } from "@/context/AuthContext";
import { updateMe } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";

export default function OnboardingPage(): JSX.Element {
  const [nickname, setNickname] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user, profile, isLoading, refreshProfile } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (profile) router.replace("/");
  }, [isLoading, user, profile, router]);

  if (isLoading || !user || profile) return <>로딩중</>;

  const handleClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateMe(nickname);
      await refreshProfile();
      setIsSubmitting(false);
      router.replace("/");
    } catch {
      setIsSubmitting(false);
      router.push("/error?reason=signup_failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-10 w-full max-w-sm px-6">
        {/* Brand */}
        <span className="text-3xl font-bold tracking-tight text-gray-900">
          drafted
        </span>

        {/* Form */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              환영해요 👋
            </h1>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              마지막 단계예요.
              <br />
              다른 사람에게 보일 이름을 정해주세요.
            </p>
          </div>

          {/* Avatar */}
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              👤
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white border-2 border-white">
              📷
            </button>
          </div>

          {/* Nickname Field */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">닉네임</label>
            <input
              type="text"
              placeholder="design_lee"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleClick();
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
            <p className="text-xs text-gray-400 leading-relaxed">
              이력서 공개 시 본명 대신 표시됩니다 · 영문·숫자·언더스코어, 2~20자
            </p>
          </div>

          {/* Submit */}
          <button
            className="w-full py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "Drafted 시작하기"}
          </button>

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center">
            닉네임은 마이페이지에서 언제든 변경할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
