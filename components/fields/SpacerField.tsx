"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { z } from "zod";
import { LuSeparatorHorizontal } from "react-icons/lu";
import { DesignerComponent } from "./SpacerFieldDesignerComponent";
import { FormComponent } from "./SpacerFieldFormComponent";
import { PropertiesComponent } from "./SpacerFieldPropertiesComponent";

const type: ElementsType = "SpacerField";

const extraAttributes = {
  height: 20, // px
};

export const propertiesSchema = z.object({
  height: z.number().min(5).max(200),
});

export const SpacerFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
    label: "Spacer Field", // Add the required label property
  }),
  designerBtnElement: {
    icon: LuSeparatorHorizontal,
    label: "Spacer field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};