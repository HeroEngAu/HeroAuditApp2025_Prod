"use client";

import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import { RiSeparator } from "react-icons/ri";
import { DesignerComponent } from "./SeparatorFieldDesignerComponent";
import { FormComponent } from "./SeparatorFieldFormComponent";
import { PropertiesComponent } from "./SeparatorFieldPropertiesComponent";
import { z } from "zod";

const type: ElementsType = "SeparatorField";

export const extraAttributes = {
  repeatOnPageBreak: false,

};

export const propertiesSchema = z.object({
  repeatOnPageBreak: z.boolean(),
});

export const SeparatorFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
    label: "Separator field",
    height: 60,
  }),
  designerBtnElement: {
    icon: RiSeparator,
    label: "Separator field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

