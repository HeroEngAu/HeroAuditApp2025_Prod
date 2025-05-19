// components/FormElements/DateField/DesignerComponent.tsx
"use client";
import { Label } from "../ui/label";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Button } from "@aws-amplify/ui-react";
import { CustomInstance } from "./DateField";
import { FormElementInstance } from "../FormElements";

export function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, helperText } = element.extraAttributes;
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {label}
        {required && "*"}
      </Label>
      <Button className="w-full justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>Pick a date</span>
      </Button>
      {helperText && (
        <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>
      )}
    </div>
  );
}
