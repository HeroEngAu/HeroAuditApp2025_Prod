"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";

export function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const imageUrl = element.extraAttributes.imageUrl;
  const position = element.extraAttributes.position || "center";
  const preserveOriginalSize = element.extraAttributes.preserveOriginalSize;
  const label = element.extraAttributes.label;

  const justifyClass =
    position === "left"
      ? "justify-start"
      : position === "right"
        ? "justify-end"
        : "justify-center";

  if (!imageUrl) return <p className="text-muted-foreground">No image selected</p>;

  return (
    <div className="flex flex-col gap-2 w-full items-start">
      <Label>{label}</Label>

      <div className={`w-full flex ${justifyClass}`}>
        <img
          src={imageUrl}
          alt="Uploaded"
          width={0}
          height={0}
          sizes="100vw"
          style={{
            maxHeight: preserveOriginalSize ? "none" : "80px",
            width: preserveOriginalSize ? 'auto' : '200px',
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}