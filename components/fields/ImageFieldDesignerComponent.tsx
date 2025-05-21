"use client";

import Image from "next/image";
import { FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";

export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { imageUrl, position = "center" } = element.extraAttributes;

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
    <div className="flex flex-col gap-2 w-full items-start">
      <Label />
      {imageUrl ? (
        <div className={`relative ${alignmentClass} rounded-md border shadow max-h-48 w-full`} style={{ maxHeight: 192 }}>
          <Image
            src={imageUrl}
            alt="Uploaded"
            layout="responsive"
            width={800}
            height={600}
            objectFit="contain"
            className="rounded-md"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No image uploaded</p>
      )}
    </div>
  );
}
