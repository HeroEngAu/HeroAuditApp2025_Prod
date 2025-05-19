"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { ColorPicker } from "../ui/color-picker";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import useDesigner from "../hooks/useDesigner";
import { LuHeading1 } from "react-icons/lu";
import Divider from "../ui/divider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const type: ElementsType = "TitleField";

const extraAttributes = {
  title: "Title field",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  textAlign: "center" as "left" | "center" | "right",
};

const propertiesSchema = z.object({
  title: z.string().min(2).max(50),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]),
  noBackground: z.boolean().optional(),

});

export const TitleFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
    label: "Title field", 
    height: 70,
  }),
  designerBtnElement: {
    icon: LuHeading1,
    label: "Title field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,

  validate: () => true,
};

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function DesignerComponent({
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
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Title field</Label>
      <p
        className="text-xl px-2 py-1 rounded"
        style={{
          backgroundColor: backgroundColor === "transparent" ? "transparent" : backgroundColor,
          color: textColor,
          textAlign,
        }}
      >
        {title}
      </p>
    </div>
  );
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function FormComponent({
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



function PropertiesComponent({
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
        <Divider />
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
        <Divider />
        <FormField
          control={form.control}
          name="textAlign"
          render={({ }) => (
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
