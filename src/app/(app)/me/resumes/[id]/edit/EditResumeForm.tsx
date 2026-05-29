// src/app/(app)/me/resumes/[id]/edit/EditResumeForm.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateResume, deleteResume } from "@/actions/resume";
import ResumeSections from "@/components/resume/ResumeSections";
import {
  normalizeContent,
  EMPTY_BODY,
  type ResumeSection,
} from "@/types/resume";

type Resume = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  content: unknown;
  experience_years: number;
};

export default function EditResumeForm({ resume }: { resume: Resume }) {
  const [title, setTitle] = useState(resume.title);
  const [description, setDescription] = useState(resume.description ?? "");
  const [isPublic, setIsPublic] = useState(resume.is_public);
  const [experienceYears, setExperienceYears] = useState(
    resume.experience_years,
  );
  const yearsError =
    experienceYears < 0 || experienceYears > 100
      ? "0~100 사이로 입력해주세요"
      : null;
  // content(JSONB) → 섹션 배열로 정규화 (한 번만)
  const [sections, setSections] = useState<ResumeSection[]>(
    () => normalizeContent(resume.content).sections,
  );
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const updateSectionBody = (id: string, body: object) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, body } : s)),
    );

  const addSection = () => {
    const title = prompt("새 섹션 이름을 입력하세요")?.trim();
    if (!title) return;
    setSections((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, body: EMPTY_BODY },
    ]);
  };

  const deleteSection = (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (!confirm(`"${target?.title}" 섹션을 삭제할까요?`)) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (yearsError) return; // 검증 실패 시 저장 차단
    startTransition(async () => {
      const result = await updateResume(resume.id, {
        title,
        description: description.trim(),
        is_public: isPublic,
        content: { version: 1, sections },
        experience_years: experienceYears,
      });
      if (!result?.error) {
        setSavedAt(new Date());
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("정말 삭제할까요? 되돌릴 수 없어요.")) return;
    startTransition(async () => {
      await deleteResume(resume.id);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/me" className="text-sm text-gray-500 hover:underline">
          ← 내 이력서로
        </Link>
        {savedAt && (
          <span className="text-xs text-gray-400">
            저장됨 · {savedAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1">연차</label>
            <input
              type="number"
              min={0}
              max={100}
              value={experienceYears}
              onChange={(e) =>
                setExperienceYears(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                yearsError
                  ? "border-red-400 focus:ring-red-400"
                  : "focus:ring-black"
              }`}
            />
            {yearsError && (
              <p className="text-xs text-red-500 mt-1">{yearsError}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">한 줄 설명</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={100}
            placeholder="이 이력서를 한 줄로 소개해보세요 (카드에 노출돼요)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <div className="text-sm font-medium">공개</div>
            <div className="text-xs text-gray-500">
              체크하면 피드에 노출돼 다른 사람이 볼 수 있어요
            </div>
          </div>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">내용</label>
          <ResumeSections
            sections={sections}
            onChangeBody={updateSectionBody}
            onAdd={addSection}
            onDelete={deleteSection}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={isPending || !!yearsError}
          className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
