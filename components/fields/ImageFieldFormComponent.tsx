"use client";

import {
  FormElementInstance,
} from "../FormElements";
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

  const justifyClass =
    position === "left"
      ? "justify-start"
      : position === "right"
        ? "justify-end"
        : "justify-center";

  if (!imageUrl) return <p className="text-muted-foreground">No image selected</p>;

  return (
    <div className={`w-full flex ${justifyClass}`}>
      <img
        src={imageUrl}
        alt="Uploaded"
        style={{
          maxHeight: preserveOriginalSize ? "none" : "80px",
          //height: element.height ? `${element.height}px` : "auto",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}