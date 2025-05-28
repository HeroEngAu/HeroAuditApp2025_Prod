"use client";

import { MdPhotoCamera } from "react-icons/md";
import { DesignerComponent } from "./CameraFieldDesignerComponent";
import { FormComponent } from "./CameraFieldFormComponent";
import { PropertiesComponent } from "./CameraFieldPropertiesComponent";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";

export const extraAttributes = {
  content: "", // store base64 image here
  label: "",
};

const type: ElementsType = "CameraField";

export const CameraFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: "Camera Field",
    extraAttributes: {
      content: "", // base64 image
      label: "",   // now properly initialized as empty string
    },
  }),
  designerBtnElement: {
    icon: MdPhotoCamera,
    label: "Camera field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

export type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};