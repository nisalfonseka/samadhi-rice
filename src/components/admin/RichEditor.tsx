"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TBtn = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={cn(
      "grid h-8 min-w-8 place-items-center rounded-md px-2 text-sm transition-colors",
      active
        ? "bg-paddy-800 text-rice-50"
        : "text-husk hover:bg-husk/5",
    )}
  >
    {children}
  </button>
);

const Sep = () => <span className="mx-0.5 h-5 w-px bg-husk/15" />;

function Toolbar({ editor }: { editor: Editor }) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const promptLink = useCallback(() => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL (leave blank to remove)", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const onImage = async (file: File) => {
    setUploading(true);
    try {
      const signRes = await fetch("/api/admin/upload-sign", { method: "POST" });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not sign upload");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", String(sign.timestamp));
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);
      const up = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await up.json();
      if (!up.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Upload failed");
      }
      editor.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border border-b-0 border-husk/15 bg-rice-50 px-2 py-1.5">
      <TBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </TBtn>
      <TBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </TBtn>
      <TBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </TBtn>
      <Sep />
      <TBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </TBtn>
      <TBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </TBtn>
      <TBtn title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
        P
      </TBtn>
      <Sep />
      <TBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </TBtn>
      <TBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </TBtn>
      <TBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “”
      </TBtn>
      <TBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {"</>"}
      </TBtn>
      <Sep />
      <TBtn title="Link" active={editor.isActive("link")} onClick={promptLink}>
        🔗
      </TBtn>
      <TBtn
        title={uploading ? "Uploading…" : "Insert image"}
        onClick={() => fileInput.current?.click()}
      >
        {uploading ? "…" : "🖼"}
      </TBtn>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImage(f);
          e.target.value = "";
        }}
      />
      <Sep />
      <TBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </TBtn>
      <Sep />
      <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↶</TBtn>
      <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↷</TBtn>
    </div>
  );
}

export default function RichEditor({
  name,
  initial,
}: {
  name: string;
  initial?: string;
}) {
  const [html, setHtml] = useState(initial ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ HTMLAttributes: { class: "blog-img" } }),
      Placeholder.configure({ placeholder: "Begin your story…" }),
      Typography,
    ],
    content: initial ?? "",
    editorProps: {
      attributes: {
        class: "blog-prose blog-editor focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  // ensure the initial value lands in our shadow input even before any edit
  useEffect(() => {
    if (editor) setHtml(editor.getHTML());
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} />
      <div className="rounded-b-2xl border border-husk/15 bg-rice-50 p-5 min-h-[24rem]">
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
