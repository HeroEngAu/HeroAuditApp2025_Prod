"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { z } from "zod";
import { MdImage } from "react-icons/md";
import { DesignerComponent } from "./ImageFieldDesignerComponent";
import { FormComponent } from "./ImageFieldFormComponent";
import { PropertiesComponent } from "./ImageFieldPropertiesComponent";

const type: ElementsType = "ImageField";

export const extraAttributes = {
  imageUrl: "",
  position: "center",
  repeatOnPageBreak: false,
  preserveOriginalSize: false,
};

export const propertiesSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL").optional(),
  position: z.enum(["left", "center", "right"]),
  repeatOnPageBreak: z.boolean(),
  preserveOriginalSize: z.boolean(),
});

export const ImageFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
    label: "Image Field",
  }),
  designerBtnElement: {
    icon: MdImage,
    label: "Image field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};