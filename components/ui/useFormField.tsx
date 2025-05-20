"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

export type FormFieldContextValue = {
  name: string;
};

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

export type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};
