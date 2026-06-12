"use client";
import ProfileImagePicker from "@/components/profile/ProfileImagePicker";
import { useUserContext } from "@/context/AuthContext";
import { updateMe } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";

export default function OnboardingPage(): JSX.Element {
  const [nickname, setNickname] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 업로드 성공 시 temp URL — 제출 시 PUT /users/me 의 profileImageUrl 로 전달
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { user, profile, isLoading, setUser } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (profile) router.replace("/");
  }, [isLoading, user, profile, router]);

  if (isLoading || !user || profile) return <>로딩중</>;

  const handleClick = async () => {
    if (isSubmitting || isUploading) return;
    setIsSubmitting(true);
    try {
      // 이미지는 선택사항 — 안 올렸으면 profileImageUrl 필드 자체를 생략.
      const updated = await updateMe({
        nickname,
        ...(imageUrl ? { profileImageUrl: imageUrl } : {}),
      });
      // PUT 응답이 갱신된 유저 전체 → 재조회 없이 컨텍스트 직접 갱신.
      setUser(updated);
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

          {/* Avatar (선택 — 클릭해서 업로드, 스킵 가능) */}
          <ProfileImagePicker
            imageUrl={imageUrl}
            onUploaded={setImageUrl}
            onUploadingChange={setIsUploading}
          />

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
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "처리 중..." : "Drafted 시작하기"}
          </button>

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center">
            닉네임과 프로필 이미지는 마이페이지에서 언제든 변경할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
