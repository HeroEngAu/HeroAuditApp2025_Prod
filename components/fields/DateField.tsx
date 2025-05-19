// components/FormElements/DateField.ts
import { z } from "zod";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { DesignerComponent } from "./DateFieldDesignerComponent";
import { FormComponent } from "./DateFieldFormComponent";
import { PropertiesComponent } from "./DateFieldPropertiesComponent";

const type: ElementsType = "DateField";

export const extraAttributes = {
  label: "Date field",
  helperText: "Pick a date",
  required: false,
};

export const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false).optional(),
});

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const DateFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: extraAttributes.label,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: BsFillCalendarDateFill,
    label: "Date Field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement, currentValue) => {
    const element = formElement as CustomInstance;
    return element.extraAttributes.required ? currentValue.length > 0 : true;
  },
};
