"use client";

import {
  FormElementInstance,
  SubmitFunction,
} from "../FormElements"; // Ensure the file exists and the path is correct
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CustomInstance, SelectFieldFormElement } from "./SelectField";
import { cn } from "../../lib/utils";

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

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, placeHolder, helperText, options } =
    element.extraAttributes;

  const selectedLabel = options.find((opt) => opt === value) || "";

  if (pdf) {
    return (
      <div className="p-2 border rounded">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && "*"}
        </label>
        <p>{selectedLabel || "—"}</p>
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
        <div className="border rounded px-2 py-1 bg-gray-100 text-sm text-gray-800 min-h-[2.25rem] flex items-center">
          {selectedLabel || placeHolder || "—"}
        </div>
      ) : (
        <Select
          value={value}
          onValueChange={(selectedValue) => {
            setValue(selectedValue);
            if (!submitValue) return;
            const valid = SelectFieldFormElement.validate(element, selectedValue);
            setError(!valid);
            submitValue(element.id, selectedValue);
          }}
        >
          <SelectTrigger className={cn("w-full", error && "border-red-500")}>
            <SelectValue placeholder={placeHolder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      )}

      {helperText && (
        <p
          className={cn(
            "text-muted-foreground text-[0.8rem]",
            error && "text-red-500",
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}