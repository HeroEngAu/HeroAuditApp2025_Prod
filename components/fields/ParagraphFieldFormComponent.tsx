"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { CustomInstance } from "./ParagraphField";

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