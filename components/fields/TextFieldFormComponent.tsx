"use client";

import {
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { CustomInstance, TextFieldFormElement } from "./TextField";

export function FormComponent({
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

  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState(false);

  const { label, required, placeHolder, helperText } = element.extraAttributes;

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);
  
  if (pdf) {
    return (
      <div className="p-2 border rounded">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && "*"}
        </label>
        <p className="whitespace-pre-wrap break-words text-sm min-h-[2.5rem]">
          {value || "-"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={cn(error && "text-red-500")}>
        {label}
        {required && "*"}
      </Label>

      {readOnly ? (
        <div className="w-full border rounded p-2 text-sm break-words min-h-[2.5rem]">
          {value || "-"}
        </div>
      ) : (
        <Input
          className={cn(error && "border-red-500")}
          placeholder={placeHolder}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => {
            if (!submitValue) return;
            const valid = TextFieldFormElement.validate(element, e.target.value);
            setError(!valid);
            if (!valid) return;
            submitValue(element.id, e.target.value);
          }}
          value={value}
          disabled={readOnly}
        />
      )}

      {helperText && (
        <p
          className={cn(
            "text-muted-foreground text-[0.8rem]",
            error && "text-red-500"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}