"use client";

import { FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";
import { useRef } from "react";
import { StorageImage } from '@aws-amplify/ui-react-storage';
export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const {
    preserveOriginalSize,
    label,
    position,
    width,
    height,
  } = element.extraAttributes;

  const containerRef = useRef<HTMLDivElement>(null);

  let alignmentClass = "";
  switch (position) {
    case "left":
      alignmentClass = "ml-0 mr-auto";
      break;
    case "right":
      alignmentClass = "ml-auto mr-0";
      break;
    case "center":
    default:
      alignmentClass = "mx-auto";
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2 w-full items-start">
      <Label>{label}</Label>

      {element.extraAttributes.imageUrl ? (
        <div className={`w-full flex ${position === "left" ? "justify-start" : position === "right" ? "justify-end" : "justify-center"}`}>
          <StorageImage
            path={element.extraAttributes.imageUrl}
            alt={label}
            className="rounded-md border shadow object-contain"
            style={{
              maxWidth: preserveOriginalSize ? undefined : `${width}px`,
              maxHeight: preserveOriginalSize ? undefined : `${height}px`,
              width: preserveOriginalSize ? `${width}px` : "100%",
              height: preserveOriginalSize ? `${height}px` : "auto",
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No image uploaded</p>
      )}
    </div>
  );
}
