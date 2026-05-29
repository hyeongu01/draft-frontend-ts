// src/components/resume/ResumeSections.tsx
"use client";

import ResumeEditor from "./ResumeEditor";
import type { ResumeSection } from "@/types/resume";

type Props = {
  sections: ResumeSection[];
  onChangeBody: (id: string, body: object) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
};

export default function ResumeSections({
  sections,
  onChangeBody,
  onAdd,
  onDelete,
}: Props) {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border rounded-lg p-4 bg-white"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">
              {section.title}
            </div>
            <button
              type="button"
              onClick={() => onDelete(section.id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              섹션 삭제
            </button>
          </div>
          <ResumeEditor
            value={section.body}
            onChange={(body) => onChangeBody(section.id, body)}
            placeholder={`${section.title} 내용을 작성해보세요…`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full py-2.5 border border-dashed rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400"
      >
        + 섹션 추가
      </button>
    </div>
  );
}
