// src/components/fields/TableField.tsx
"use client";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { z } from "zod";
import { MdTableChart } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";
import { DesignerComponent } from "./TableFieldDesignerComponent";
import { FormComponent } from "./TableFieldFormComponent";
import { PropertiesComponent } from "./TableFieldPropertiesComponent";
const type: ElementsType = "TableField";

const extraAttributes = {
  rows: 2,
  columns: 2,
  label: "",
  required: false,
  data: [["", ""], ["", ""]],
  columnHeaders: ["Col 1", "Col 2"],
};

export const propertiesSchema = z.object({
  rows: z.number().min(1).max(500),
  columns: z.number().min(1).max(10),
  label: z.string().min(0).max(50),
  required: z.boolean().optional(),
  data: z.array(z.array(z.string())).optional(),
  columnHeaders: z.array(z.string()).optional(),
});

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const TableFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: extraAttributes.label,
    extraAttributes,
    height: 0, // Initialize height with a default value
  }),
  designerBtnElement: {
    icon: MdTableChart,
    label: "Table Field",
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
      return currentValue === "true";
    }
    return true;
  },
};







