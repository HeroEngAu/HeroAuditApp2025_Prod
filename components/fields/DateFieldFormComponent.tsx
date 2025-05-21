"use client";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { FormElementInstance, SubmitFunction } from "../FormElements";
import { CustomInstance, DateFieldFormElement } from "./DateField";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  const [date, setDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null
  );

  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, helperText } = element.extraAttributes;

  if (pdf || readOnly) {
    return (
      <div className="p-2 border rounded">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {element.label}
        </label>
        <p>{date ? format(date, "dd/MM/yyyy") : "-"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={cn(error && "text-red-500")}>
        {label}
        {required && "*"}
      </Label>
      <div className={cn("relative", error && "border border-red-500 rounded")}>
        <ReactDatePicker
          selected={date}
          onChange={(date: Date | null) => {
            setDate(date);
            if (!submitValue) return;
            const value: string = date?.toUTCString() || "";
            const valid: boolean = DateFieldFormElement.validate(element, value);
            setError(!valid);
            submitValue(element.id, value);
          }}
          dateFormat="dd.MM.yyyy"
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholderText="Pick a date"
          calendarClassName="z-50"
          disabled={readOnly}
        />
        <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
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
