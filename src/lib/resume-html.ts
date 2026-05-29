// src/lib/resume-html.ts
// 섹션별 Tiptap ProseMirror JSON을 서버에서 정적 HTML로 렌더.
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

// 편집기와 동일한 확장으로 렌더해야 마크/노드가 보존됨
const EXTENSIONS = [StarterKit];

function isProseMirrorDoc(body: unknown): body is { type: "doc" } {
  return (
    !!body &&
    typeof body === "object" &&
    (body as { type?: string }).type === "doc"
  );
}

// 빈 섹션({})이거나 내용이 없으면 null 반환 → 호출부에서 스킵
export function sectionBodyToHtml(body: unknown): string | null {
  if (!isProseMirrorDoc(body)) return null;
  const html = generateHTML(body, EXTENSIONS);
  // 내용이 빈 문단뿐이면 표시하지 않음
  if (!html || html === "<p></p>") return null;
  return html;
}
