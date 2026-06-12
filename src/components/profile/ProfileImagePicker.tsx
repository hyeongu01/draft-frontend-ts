"use client";
// 프로필 이미지 업로드 공용 컴포넌트 (온보딩·프로필 수정 다이얼로그에서 사용).
// 클릭 → 숨김 file input → 5MB 사전 차단 → 즉시 temp 업로드(POST /files/profile-image/upload)
// → 원형 미리보기. 업로드 중 스피너/디밍, 에러 표시, 같은 파일 재선택 허용.
// temp URL은 onUploaded로 부모에 전달 — PUT /users/me 에 보내야 영구 반영(promote).
import { filesControllerUploadFile } from "@/lib/api/generated/files/files";
import { useRef, useState } from "react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB (백엔드 계약)

type Props = {
  // 현재 미리보기 URL (temp 또는 영구). null이면 fallback 표시.
  imageUrl: string | null;
  // temp 업로드 성공 시 호출 (부모가 PUT 시점에 profileImageUrl로 전달)
  onUploaded: (tempUrl: string) => void;
  // 업로드 진행 상태 변화 통지 (부모의 제출/저장 버튼 비활성용)
  onUploadingChange?: (uploading: boolean) => void;
  // 이미지 없을 때 표시할 폴백 (기본 👤 — 다이얼로그에선 이니셜 등)
  fallback?: React.ReactNode;
  // 에러 없을 때 하단 안내 문구
  helperText?: string;
  disabled?: boolean;
};

export default function ProfileImagePicker({
  imageUrl,
  onUploaded,
  onUploadingChange,
  fallback,
  helperText = "선택사항 · 5MB 이하",
  disabled = false,
}: Props) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("이미지는 5MB 이하만 올릴 수 있어요.");
      return;
    }
    setImageError(null);
    setUploading(true);
    try {
      const { profileImageUrl } = await filesControllerUploadFile({ file });
      onUploaded(profileImageUrl);
    } catch {
      setImageError("이미지 업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const blocked = disabled || isUploading;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <button
          type="button"
          aria-label="프로필 이미지 업로드"
          disabled={blocked}
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl overflow-hidden cursor-pointer disabled:cursor-wait"
        >
          {imageUrl ? (
            // R2 도메인이 유동적이라 next/image remotePatterns 대신 일반 img 사용
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="프로필 이미지 미리보기"
              className="w-full h-full object-cover"
            />
          ) : (
            fallback ?? <span aria-hidden>👤</span>
          )}
        </button>
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        )}
        <button
          type="button"
          aria-label="프로필 이미지 선택"
          disabled={blocked}
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white border-2 border-white"
        >
          📷
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {imageError ? (
        <p className="text-xs text-red-500">{imageError}</p>
      ) : (
        helperText && <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
