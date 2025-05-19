"use client";

import { FormElementInstance } from "../FormElements";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type CustomInstance = FormElementInstance & {
  extraAttributes: {
    label: string;
    helperText: string;
    required: boolean;
  };
};

export default function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, required, helperText } = element.extraAttributes;
  const id = `checkbox-${element.id}`;

  return (
    <div className="flex items-top space-x-2">
      <Checkbox id={id} />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id}>
          {label}
          {required && "*"}   
        </Label>
        {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
      </div>
    </div>
  );
}
