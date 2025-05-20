"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { CustomInstance } from "./SpacerField";

export function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;

  const { height } = element.extraAttributes;
  return <div style={{ height, width: "100%" }}></div>;
}