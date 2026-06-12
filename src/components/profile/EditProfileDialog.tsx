"use client";
// 프로필 수정 다이얼로그 — /me 헤더의 "프로필 수정" 트리거 포함.
// 아바타(temp 업로드/기본 이미지 복원)와 닉네임을 dirty 필드만 PUT /users/me 로 전송.
// 응답 유저를 setUser로 주입해 재조회 없이 갱신. 취소 시 temp 업로드는 버려짐(PUT 안 보내면 promote 안 됨).
import ProfileImagePicker from "@/components/profile/ProfileImagePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserContext } from "@/context/AuthContext";
import type { UpdateUserDto } from "@/lib/api/generated/model";
import { updateMe } from "@/lib/api/users";
import { useState } from "react";

export default function EditProfileDialog() {
  const { profile, setUser } = useUserContext();
  const [open, setOpen] = useState<boolean>(false);

  // 현재 프로필 기준 초기값 (오픈 시마다 리셋)
  const initialNickname = profile?.nickname ?? "";
  const initialImageUrl = profile?.profileImageUrl ?? null;

  const [nickname, setNickname] = useState<string>(initialNickname);
  // 미리보기 단일 상태 — 새 업로드 시 temp URL, "기본 이미지로 변경" 시 null.
  // 마지막 액션이 이긴다: null 예약 후 재업로드하면 temp URL로 덮임.
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // 재오픈 시 현재 프로필 기준으로 리셋
      setNickname(initialNickname);
      setImageUrl(initialImageUrl);
      setError(null);
      setIsSaving(false);
      setIsUploading(false);
    }
    setOpen(next);
  };

  // dirty check — 변경된 필드만 PUT body에 포함
  const trimmedNickname = nickname.trim();
  const nicknameDirty =
    trimmedNickname.length > 0 && trimmedNickname !== initialNickname;
  const imageDirty = imageUrl !== initialImageUrl;
  const isDirty = nicknameDirty || imageDirty;

  const handleSave = async () => {
    if (!isDirty || isUploading || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const dto: UpdateUserDto = {
        ...(nicknameDirty ? { nickname: trimmedNickname } : {}),
        // null 전송 = 기존 이미지 삭제 후 기본 프로필 복원, temp URL = 영구 반영(promote)
        ...(imageDirty ? { profileImageUrl: imageUrl } : {}),
      };
      const updated = await updateMe(dto);
      setUser(updated); // 재조회 없이 컨텍스트 갱신
      setOpen(false);
    } catch {
      setError("프로필 수정에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="px-2.5 py-1 border rounded-md text-xs text-gray-600 hover:bg-gray-50">
          프로필 수정
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            닉네임과 프로필 이미지를 변경할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2">
          <ProfileImagePicker
            imageUrl={imageUrl}
            onUploaded={setImageUrl}
            onUploadingChange={setIsUploading}
            disabled={isSaving}
            helperText="5MB 이하"
            fallback={
              <span
                aria-hidden
                className="text-2xl font-semibold text-gray-600"
              >
                {(trimmedNickname || initialNickname)[0]?.toUpperCase() ?? "U"}
              </span>
            }
          />
          {imageUrl !== null && (
            <button
              type="button"
              disabled={isUploading || isSaving}
              onClick={() => setImageUrl(null)}
              className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700 disabled:opacity-50"
            >
              기본 이미지로 변경
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">닉네임</label>
          <input
            type="text"
            placeholder="design_lee"
            value={nickname}
            disabled={isSaving}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSave();
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors"
          />
          <p className="text-xs text-gray-400 leading-relaxed">
            영문·숫자·언더스코어, 2~20자
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
            className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isUploading || isSaving}
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
