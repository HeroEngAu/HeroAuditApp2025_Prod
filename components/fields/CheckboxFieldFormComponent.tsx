"use client";

import { useEffect, useState } from "react";
import { FormElementInstance, SubmitFunction } from "../FormElements";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

type CustomInstance = FormElementInstance & {
  extraAttributes: {
    label: string;
    helperText: string;
    required: boolean;
  };
};

export default function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
  readOnly,
  pdf,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
  pdf?: boolean;
}) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState<boolean>(defaultValue === "true");
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, helperText } = element.extraAttributes;
  const id = `checkbox-${element.id}`;

  if (pdf) {
    return (
      <div className="flex items-top space-x-2">
        <Checkbox id={id} checked={value} disabled={readOnly} />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor={id} className={cn(error && "text-red-500")}>
            {label}
            {required && "*"}
          </Label>
          {helperText && (
            <p className={cn("text-muted-foreground text-[0.8rem]", error && "text-red-500")}>
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-top space-x-2">
      <Checkbox
        id={id}
        checked={value}
        className={cn(error && "border-red-500")}
        onCheckedChange={(checked) => {
          const newValue = checked === true;
          setValue(newValue);
          if (!submitValue) return;
          const stringValue = newValue ? "true" : "false";
          // validação simples inline, deve vir do CheckboxFieldFormElement
          const valid = !required || stringValue === "true";
          setError(!valid);
          submitValue(element.id, stringValue);
        }}
        disabled={readOnly}
      />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className={cn(error && "text-red-500")}>
          {label}
          {required && "*"}
        </Label>
        {helperText && (
          <p className={cn("text-muted-foreground text-[0.8rem]", error && "text-red-500")}>
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}
