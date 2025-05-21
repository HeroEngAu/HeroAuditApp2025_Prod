"use client";

import { FormElementInstance } from "../FormElements";
import { CustomInstance, propertiesSchema } from "./SeparatorField";
import { Label } from "../ui/label";
//import { Switch } from "../ui/switch"; // supondo que você tem um componente Switch estilizado
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDesigner from "../hooks/useDesigner";
import { useEffect } from "react";
import {
  Form,
} from "../ui/form";

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      repeatOnPageBreak: element.extraAttributes.repeatOnPageBreak,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes as propertiesFormSchemaType);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { repeatOnPageBreak } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        repeatOnPageBreak,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-3"
      >
        <div className="space-y-1">
          <Label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.watch("repeatOnPageBreak")}
              onChange={(e) =>
                form.setValue("repeatOnPageBreak", e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="mr-2"
            />
            <span>Repeat on page break</span>
          </Label>
        </div>
      </form>
    </Form>
  );
}
