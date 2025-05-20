"use client";

import { ElementsType, FormElement } from "../FormElements";
import { RiSeparator } from "react-icons/ri";
import { DesignerComponent } from "./SeparatorFieldDesignerComponent";
import { FormComponent } from "./SeparatorFieldFormComponent";
import { PropertiesComponent } from "./SeparatorFieldPropertiesComponent";

const type: ElementsType = "SeparatorField";

export const SeparatorFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
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



