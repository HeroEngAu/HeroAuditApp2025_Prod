"use client";

import { ElementsType, FormElement } from "../FormElements";
import { Label } from "../ui/label";
import { RiFilePaper2Line } from "react-icons/ri"; // Ícone diferente do Separator
import clsx from "clsx";

const type: ElementsType = "PageBreakField";

export const PageBreakFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    label: "Page Break",
    height: 60,
  }),
  designerBtnElement: {
    icon: RiFilePaper2Line,
    label: "Page Break",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

function DesignerComponent() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Page Break (visual only)</Label>
      <div className={pageBreakClass} />
    </div>
  );
}

function FormComponent() {
  return <div className={pageBreakClass} />;
}

function PropertiesComponent() {
  return <p>No properties for this element</p>;
}

const pageBreakClass = clsx(
  "w-full border-t border-dashed border-gray-400 my-6",
  "print:break-before-page"
);
