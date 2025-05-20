"use client";

import { Label } from "../ui/label";
import clsx from "clsx";

const pageBreakClass = clsx(
  "w-full border-t border-dashed border-gray-400 my-6",
  "print:break-before-page"
);

export function DesignerComponent() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Page Break (visual only)</Label>
      <div className={pageBreakClass} />
    </div>
  );
}