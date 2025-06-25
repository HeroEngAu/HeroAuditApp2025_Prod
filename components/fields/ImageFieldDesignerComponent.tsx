"use client";

import useDesigner from "../hooks/useDesigner";
import { FormElementInstance } from "../FormElements";
import { Label } from "../ui/label";
import { CustomInstance } from "./ImageField";
import { useEffect, useRef, useCallback } from "react";
import { StorageImage } from "@aws-amplify/ui-react-storage";

export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;

  const {
    preserveOriginalSize,
    label,
    position,
    width,
    height,
    imageUrl,
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
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [updateHeight]);

  const justifyClass =
    position === "left"
      ? "justify-start"
      : position === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <div ref={containerRef} className="flex flex-col gap-2 w-full items-start">
      <Label>{label}</Label>

      {imageUrl ? (
        <div className={`w-full flex ${justifyClass}`}>
          <StorageImage
            path={imageUrl}
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
