// components/FormElements/DateField/FormComponent.tsx
"use client";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "@aws-amplify/ui-react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FormElementInstance, SubmitFunction } from "../FormElements";
import { CustomInstance, DateFieldFormElement } from "./DateField";

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

  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
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
        <p>{date ? format(date, "PPP") : "-"}</p>
      </div>
    );
  }
    return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={cn(error && "text-red-500")}>
        {label}
        {required && "*"}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-red-500",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date: Date | undefined) => {
              setDate(date);

              if (!submitValue) return;
              const value: string = date?.toUTCString() || "";
              const valid: boolean = DateFieldFormElement.validate(
                element,
                value,
              );
              setError(!valid);
              submitValue(element.id, value);
            }}
            initialFocus
            disabled={readOnly}
          />
        </PopoverContent>
      </Popover>
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
