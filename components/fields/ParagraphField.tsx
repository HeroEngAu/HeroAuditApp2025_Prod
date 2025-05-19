"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { useEffect, useRef, useState } from "react";
import { BsTextParagraph } from "react-icons/bs";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import { Button } from "../ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import { Input } from "../ui/input";

type ParagraphFieldAttributes = {
  text: string;
};

type CustomInstance = FormElementInstance & {
  extraAttributes: ParagraphFieldAttributes;
};

const type: ElementsType = "ParagraphField";

export const ParagprahFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: { text: "<p>Text here</p>" },
    label: "Paragraph Field",
    height : 70,
  }),
  designerBtnElement: {
    icon: BsTextParagraph,
    label: "Paragraph field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

export function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const contentHeight = Math.round(entry.contentRect.height + 50);
        if (contentHeight !== elementInstance.height) {
          elementInstance.height = contentHeight;
          setHeight(contentHeight);
        }
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [elementInstance]);

  return (
    <div style={{ height: `${height}px` }}>
      <div
        ref={contentRef}
        className="p-2 border rounded-md w-[900px] text-sm break-words whitespace-pre-wrap min-h-[60px]"
        dangerouslySetInnerHTML={{ __html: element.extraAttributes.text }}
      />
    </div>
  );
}
export function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;

  if (!element.extraAttributes) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="p-2 border rounded-md w-full text-sm break-words whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: element.extraAttributes.text }}
    />
  );
}


export function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;

  if (!element.extraAttributes) {
    return <div>Loading...</div>;
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle, 
      Color,
      TextAlign.configure({ types: ["paragraph"] }),
      Underline,
    ],
    content: element.extraAttributes.text,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      element.extraAttributes.text = html;
    },
  });
  

  useEffect(() => {
    if (editor && element.extraAttributes.text !== editor.getHTML()) {
      editor.commands.setContent(element.extraAttributes.text);
    }
  }, [editor, element.extraAttributes.text]);

  if (!editor) return null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-4 py-2 ${editor.isActive("bold") ? "bg-blue-500 text-white" : "text-black"}`}
          >
            <strong>B</strong>
          </Button>
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-4 py-2 ${editor.isActive("italic") ? "bg-blue-500 text-white" : "text-black"}`}
          >
            <em>I</em>
          </Button>
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-4 py-2 ${editor.isActive("underline") ? "bg-blue-500 text-white" : "text-black"}`}
          >
            <u>U</u>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`px-4 py-2 ${editor.isActive("textAlign") && editor.getAttributes("textAlign").textAlign === "left" ? "bg-blue-500 text-white" : "text-black"}`}
          >
            Left
          </Button>
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`px-4 py-2 ${editor.isActive("textAlign") && editor.getAttributes("textAlign").textAlign === "center" ? "bg-blue-500 text-white" : "text-black"}`}
          >
            Center
          </Button>
          <Button
            variant="outline"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`px-4 py-2 ${editor.isActive("textAlign") && editor.getAttributes("textAlign").textAlign === "right" ? "bg-blue-500 text-white" : "text-black"}`}
          >
            Right
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Font Color</label>
          <Input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className="w-12"
          />
        </div>

      </div>

      <EditorContent editor={editor} className="border p-4 rounded-md shadow-md" />
    </div>
  );
}



