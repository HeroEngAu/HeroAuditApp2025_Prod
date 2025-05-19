"use client";

import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import useDesigner from "../hooks/useDesigner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Form,
  FormLabel,
} from "../ui/form";
import { MdImage } from "react-icons/md";

import { Button } from "../ui/button";
import { Upload } from "lucide-react";


const type: ElementsType = "ImageField";

const extraAttributes = {
  imageUrl: "",
  position: "center",
  repeatOnPageBreak: false,
};


const propertiesSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL").optional(),
  position: z.enum(["left", "center", "right"]),
  repeatOnPageBreak: z.boolean(),
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

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { imageUrl, position = "center" } = element.extraAttributes;

  let alignmentClass = "";
  switch (position) {
    case "left":
      alignmentClass = "ml-0 mr-auto";
      break;
    case "right":
      alignmentClass = "ml-auto mr-0";
      break;
    case "center":
    default:
      alignmentClass = "mx-auto";
  }

  return (
    <div className="flex flex-col gap-2 w-full items-start">
      <Label />
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Uploaded"
          className={`block ${alignmentClass} rounded-md border shadow max-h-48 w-auto object-contain`}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">No image uploaded</p>
      )}
    </div>
  );
}


function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const imageUrl = element.extraAttributes.imageUrl;
  const position = element.extraAttributes.position || "center";

  const justifyClass =
    position === "left"
      ? "justify-start"
      : position === "right"
        ? "justify-end"
        : "justify-center";

  if (!imageUrl) return <p className="text-muted-foreground">No image selected</p>;

  return (
    <div className={`w-full flex ${justifyClass}`}>
      <img
        src={imageUrl}
        alt="Uploaded"
        style={{
          height: element.height ? `${element.height}px` : "auto",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

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
      imageUrl: element.extraAttributes.imageUrl,
      position: ["center", "left", "right"].includes(element.extraAttributes.position)
        ? (element.extraAttributes.position as "center" | "left" | "right")
        : "center",
      repeatOnPageBreak: element.extraAttributes.repeatOnPageBreak,
    },
  });


  useEffect(() => {
    form.reset(element.extraAttributes as propertiesFormSchemaType);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { imageUrl, position, repeatOnPageBreak } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        imageUrl: imageUrl || "",
        position,
        repeatOnPageBreak,
      },
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      const img = new Image();
      img.onload = () => {
        const naturalHeight = img.naturalHeight;
        const minHeight = 60;
        const finalHeight = Math.max(naturalHeight, minHeight);

        updateElement(element.id, {
          ...element,
          extraAttributes: {
            ...element.extraAttributes,
            imageUrl: base64,
          },
          height: finalHeight,
        });
      };
      img.src = base64;
    };


    reader.readAsDataURL(file);
  }


  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }
  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-3"
      >
        <div className="space-y-1">
          <FormLabel> </FormLabel>
          <Button
            type="button"
            onClick={handleUploadClick}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="space-y-1">
          <FormLabel>Image Position</FormLabel>
          <Select
            onValueChange={(value) => form.setValue("position", value as "left" | "center" | "right")}
            value={form.watch("position")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
