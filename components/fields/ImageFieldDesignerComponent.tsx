"use client";

import useDesigner from "../hooks/useDesigner";
import {
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";
import { useEffect, useRef, useCallback } from "react";

export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;
  const {
    preserveOriginalSize,
    imageUrl,
    label,
    position = "center",
    width,
    height,
  } = element.extraAttributes;

  const containerRef = useRef<HTMLDivElement>(null);

  const updateHeight = useCallback(() => {
    if (containerRef.current) {
      const newHeight = containerRef.current.offsetHeight;
      if (element.height !== newHeight) {
        updateElement(element.id, {
          ...element,
          height: newHeight,
        });
      }
    }
  }, [element, updateElement]);

  useEffect(() => {
    updateHeight();
  }, [updateHeight]);

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

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Uploaded"
          className={`${alignmentClass} rounded-md border shadow object-contain`}
          width={width ?? (preserveOriginalSize ? undefined : 200)}
          height={height ?? (preserveOriginalSize ? undefined : 80)}
          style={{
            maxWidth: '100%',
          }}
          onLoad={updateHeight}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">No image uploaded</p>
      )}
    </div>
  );
}
