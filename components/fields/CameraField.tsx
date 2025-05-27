"use client";

import { MdPhotoCamera } from "react-icons/md";
import { DesignerComponent } from "./CameraFieldDesignerComponent";
import { FormComponent } from "./CameraFieldFormComponent";
import { PropertiesComponent } from "./CameraFieldPropertiesComponent";
import { ElementsType, FormElement } from "../FormElements";

const type: ElementsType = "CameraField";

export const CameraFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: "Camera Field",
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