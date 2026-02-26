"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Wpisz treść strony...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#FF4D4F] underline hover:text-[#FF3B30]",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] max-w-none px-4 py-3",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-[14px] border border-[#EEEEEE] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-[#EEEEEE] bg-[#FAFAFA] p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("bold") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Pogrubienie (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("italic") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Kursywa (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("underline") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Podkreślenie (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("strike") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Przekreślenie"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="w-px h-8 bg-[#EEEEEE] mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Nagłówek 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Nagłówek 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Nagłówek 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-8 bg-[#EEEEEE] mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("bulletList") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Lista wypunktowana"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("orderedList") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Lista numerowana"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-8 bg-[#EEEEEE] mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Wyrównaj do lewej"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Wyśrodkuj"
        >
          <AlignCenter className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Wyrównaj do prawej"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-[#FF4D4F] text-white"
              : "text-[#1F1F1F]"
          }`}
          title="Wyjustuj"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="w-px h-8 bg-[#EEEEEE] mx-1" />

        {/* Quote & Link */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("blockquote") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Cytat"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors ${
            editor.isActive("link") ? "bg-[#FF4D4F] text-white" : "text-[#1F1F1F]"
          }`}
          title="Link (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-8 bg-[#EEEEEE] mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors text-[#1F1F1F] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Cofnij (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-[#EEEEEE] transition-colors text-[#1F1F1F] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Ponów (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
