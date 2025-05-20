"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./TitleField";

export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const {
    title,
    backgroundColor = "#ffffff",
    textColor = "#000000",
    textAlign = "left",
  } = element.extraAttributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Title field</Label>
      <p
        className="text-xl px-2 py-1 rounded"
        style={{
          backgroundColor: backgroundColor === "transparent" ? "transparent" : backgroundColor,
          color: textColor,
          textAlign,
        }}
      >
        {title}
      </p>
    </div>
  );
}