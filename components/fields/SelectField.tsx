"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements"; // Ensure the file exists and the path is correct
import { z } from "zod";
import { RxDropdownMenu } from "react-icons/rx";
import { DesignerComponent } from "./SelectFieldDesignerComponent";
import { FormComponent } from "./SelectFieldFormComponent";
import { PropertiesComponent } from "./SelectFieldPropertiesComponent";

const type: ElementsType = "SelectField";

const extraAttributes = {
  label: "Select field",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value here...",
  options: [],
};

export const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false).optional(),
  placeHolder: z.string().max(50),
  options: z.array(z.string()).default([]).optional(),
});

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const SelectFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: extraAttributes.label, // Add the label property
    extraAttributes,
  }),
  designerBtnElement: {
    icon: RxDropdownMenu,
    label: "Select Field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (
    formElement: FormElementInstance,
    currentValue: string,
  ): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }

    return true;
  },
};