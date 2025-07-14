"use client";

import { FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";
import { getUrl } from "aws-amplify/storage";
import { useEffect, useState } from "react";
import Image from "next/image";

export function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const s3Key = element.extraAttributes.imageUrl;
  const position = element.extraAttributes.position || "center";
  const preserveOriginalSize = element.extraAttributes.preserveOriginalSize;
  const label = element.extraAttributes.label;
  const width = element.extraAttributes.width;
  const height = element.extraAttributes.height;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!s3Key) return;
    getUrl({ path: s3Key }).then(({ url }) => {
      setSignedUrl(url.toString());
    });
  }, [s3Key]);

  if (!s3Key) return <p className="text-muted-foreground">No image selected</p>;
  if (!signedUrl) return <p className="text-muted-foreground">Loading image...</p>;

  return (
    <div className="flex flex-col gap-2 w-full items-start">
      <Label>{label}</Label>

      <div className={`w-full flex ${position === "left" ? "justify-start" : position === "right" ? "justify-end" : "justify-center"}`}>
        <Image
          src={signedUrl}
          alt="Uploaded"
          unoptimized
          width={width ?? 200}
          height={height ?? 200}
          className="rounded-md border object-contain"
          style={{
            maxWidth: preserveOriginalSize ? undefined : `${width}px`,
            maxHeight: preserveOriginalSize ? undefined : `${height}px`,
            width: width ?? (preserveOriginalSize ? undefined : 200),
            height: preserveOriginalSize ? `${height}px` : "auto",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
