"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { ColorPicker } from "../ui/color-picker";
import {
  FormElementInstance,
} from "../FormElements";
import useDesigner from "../hooks/useDesigner";
//import Divider from "../ui/divider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { CustomInstance, propertiesSchema } from "./TitleField";
import { z } from "zod";

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
      title: element.extraAttributes.title,
      backgroundColor: element.extraAttributes.backgroundColor || "#ffffff", // default to white
      textColor: element.extraAttributes.textColor || "#000000", // default to black
      textAlign: element.extraAttributes.textAlign as "center",
      noBackground: element.extraAttributes.backgroundColor === "transparent",
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes as propertiesFormSchemaType);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { title, backgroundColor, textColor, textAlign, noBackground } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        title,
        backgroundColor: noBackground ? "transparent" : backgroundColor,
        textColor,
        textAlign,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormControl>
                <div>
                  <ColorPicker
                    {...field}
                    value={field.value || ""}
                    onChange={(color: string) => field.onChange(color || "transparent")}
                    disabled={form.watch("noBackground")}
                  />
                  <div className="mt-2 flex items-center space-x-2">
                    <Checkbox
                      checked={form.watch("noBackground")}
                      onCheckedChange={(checked: boolean) => {
                        form.setValue("noBackground", checked);
                        if (checked) {
                          form.setValue("backgroundColor", "transparent");
                        }
                      }}
                    />
                    <label className="text-sm">Transparent Background</label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="textColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <FormControl>
                <ColorPicker
                  {...field}
                  value={field.value || ""}
                  onChange={(color: string) => field.onChange(color)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="textAlign"
          render={() => (
            <FormItem>
              <FormLabel>Text Alignment</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => form.setValue("textAlign", value as "left" | "center" | "right")}
                  value={form.watch("textAlign")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </form>
    </Form>
  );
}