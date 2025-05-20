"use client";

import { Label } from "../ui/label";
import { Separator } from "../ui/divider";

export function DesignerComponent() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Separator field</Label>
      <Separator />
    </div>
  );
}