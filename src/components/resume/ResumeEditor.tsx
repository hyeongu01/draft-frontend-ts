// src/components/resume/ResumeEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type ResumeEditorProps = {
  value?: object | null;
  onChange?: (json: object) => void;
  placeholder?: string;
};

export default function ResumeEditor({
  value,
  onChange,
  placeholder = "이력서 내용을 작성해보세요…",
}: ResumeEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    // content가 빈 객체({})면 ProseMirror가 거부하므로 undefined로 넘김
    content: value && Object.keys(value).length > 0 ? value : undefined,
    immediatelyRender: false, // SSR hydration 경고 방지
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[150px] focus:outline-none px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  return (
    <div className="border rounded-md focus-within:ring-2 focus-within:ring-black">
      <EditorContent editor={editor} />
    </div>
  );
}
