"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { CustomInstance } from "./TitleField";

export function FormComponent({
  elementInstance,

}: {
  elementInstance: FormElementInstance;

}) {
  const element = elementInstance as CustomInstance;
  const {
    title,
    backgroundColor = "#ffffff",
    textColor = "#000000",
    textAlign = "left",
  } = element.extraAttributes;

  return (
    <p
      style={{
        backgroundColor,
        color: textColor,
        textAlign,
        fontSize: "1.25rem", // equivalente a text-xl
        padding: "0.25rem 0.5rem", // px-2 py-1
        borderRadius: "0.25rem", // rounded
        margin: 0,
      }}
    >
      {title}
    </p>
  );
}