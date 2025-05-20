"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { BsTextParagraph } from "react-icons/bs";
import { DesignerComponent } from "./ParagraphFieldDesignerComponent";
import { FormComponent } from "./ParagraphFieldFormComponent";
import { PropertiesComponent } from "./ParagraphFieldPropertiesComponent";


type ParagraphFieldAttributes = {
  text: string;
};

export type CustomInstance = FormElementInstance & {
  extraAttributes: ParagraphFieldAttributes;
};

const type: ElementsType = "ParagraphField";

export const ParagprahFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: { text: "<p>Text here</p>" },
    label: "Paragraph Field",
    height : 70,
  }),
  designerBtnElement: {
    icon: BsTextParagraph,
    label: "Paragraph field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};