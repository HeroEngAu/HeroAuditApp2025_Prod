"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { CustomInstance } from "./ImageField";
import Image from 'next/image';

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
      <Image
        src={imageUrl}
        alt="Uploaded"
        width={0}
        height={0}
        sizes="100vw"
        style={{
          maxHeight: preserveOriginalSize ? "none" : "80px",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}