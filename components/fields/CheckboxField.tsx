"use client";

import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { IoMdCheckbox } from "react-icons/io";
import DesignerComponent from "./CheckboxField/DesignerComponent";
import FormComponent from "./CheckboxField/FormComponent";
import PropertiesComponent from "./CheckboxField/PropertiesComponent";

const type: ElementsType = "CheckboxField";

const extraAttributes = {
  label: "Checkbox field",
  helperText: "Helper text",
  required: false,
};

export const CheckboxFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: extraAttributes.label,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: IoMdCheckbox,
    label: "CheckBox Field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue === "true";
    }
    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};
