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
  job_role: string | null;
  is_public: boolean;
  content: unknown;
  experience_years: number;
};

export default function EditResumeForm({ resume }: { resume: Resume }) {
  const [title, setTitle] = useState(resume.title);
  const [description, setDescription] = useState(resume.description ?? "");
  const [jobRole, setJobRole] = useState(resume.job_role ?? "");
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
        job_role: jobRole.trim(),
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
    <div className="max-w-4xl mx-auto p-6">
      {/* 툴바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/me" className="text-sm text-gray-500 hover:underline">
            ← 내 이력서로
          </Link>
          {savedAt && (
            <span className="text-xs text-gray-400">
              저장됨 · {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !!yearsError}
            className="px-4 py-1.5 bg-black text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* 2단: 좌 에디터 / 우 발행 설정 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-start">
        {/* 좌: 에디터 */}
        <div className="space-y-5 order-2 lg:order-1">
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="이력서 제목 (예: 시니어로 점프하기 위한 5년의 정리)"
              className="w-full text-2xl font-semibold text-gray-900 py-1.5 bg-transparent border-0 border-b border-gray-200 focus:border-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              placeholder="한 줄 설명 — 카드에 노출돼요"
              className="w-full mt-3 text-sm text-gray-700 py-1.5 bg-transparent border-0 border-b border-gray-200 focus:border-gray-900 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          <ResumeSections
            sections={sections}
            onChangeBody={updateSectionBody}
            onAdd={addSection}
            onDelete={deleteSection}
          />
        </div>

        {/* 우: 발행 설정 (작은 화면에선 맨 위) */}
        <aside className="border rounded-lg p-4 order-1 lg:order-2 lg:sticky lg:top-20">
          <div className="text-sm font-medium mb-4">발행 설정</div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">공개</span>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                isPublic ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPublic ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">직무</label>
            <input
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              maxLength={40}
              placeholder="예: UX 디자이너"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">연차</label>
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
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                yearsError
                  ? "border-red-400 focus:ring-red-400"
                  : "focus:ring-black"
              }`}
            />
            {yearsError && (
              <p className="text-xs text-red-500 mt-1">{yearsError}</p>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed pt-3 border-t">
            공개 시 이름은 닉네임으로 표시되고, 연락처는 노출되지 않습니다.
          </p>
        </aside>
      </div>
    </div>
  );
}
