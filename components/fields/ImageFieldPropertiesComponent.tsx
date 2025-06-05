"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import useDesigner from "../hooks/useDesigner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { CustomInstance, propertiesSchema } from "./ImageField";
import { z } from "zod";
import { Input } from "../ui/input";

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
      imageUrl: element.extraAttributes.imageUrl,
      position: ["center", "left", "right"].includes(element.extraAttributes.position)
        ? (element.extraAttributes.position as "center" | "left" | "right")
        : "center",
      repeatOnPageBreak: element.extraAttributes.repeatOnPageBreak,
      preserveOriginalSize: element.extraAttributes.preserveOriginalSize,
      label: element.extraAttributes.label,
    },
  });


  useEffect(() => {
    form.reset(element.extraAttributes as propertiesFormSchemaType);
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { imageUrl, position, repeatOnPageBreak, preserveOriginalSize, label } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        imageUrl: imageUrl || "",
        position,
        repeatOnPageBreak,
        preserveOriginalSize,
        label,
      },
    });
  }

  useEffect(() => {
    const imageUrl = element.extraAttributes?.imageUrl;
    if (!imageUrl) return;
    const label = element.extraAttributes?.label;
    const img = new Image();
    img.onload = () => {
      const naturalHeight = img.naturalHeight;
      const preserveOriginalSize = form.getValues("preserveOriginalSize");

      updateElement(element.id, {
        ...element,
        height: preserveOriginalSize ? naturalHeight : 80,
        extraAttributes: {
          ...element.extraAttributes,
          preserveOriginalSize,
          position: form.getValues("position"),
          repeatOnPageBreak: form.getValues("repeatOnPageBreak"),
          label: form.getValues("label"),
        },
      });
    };
    img.src = imageUrl;
  }, [element, form, updateElement]);



  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const label = element.extraAttributes?.label;
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      const img = new Image();
      img.onload = () => {
        const naturalHeight = img.naturalHeight;
        const preserveOriginalSize = form.getValues("preserveOriginalSize");

        updateElement(element.id, {
          ...element,
          extraAttributes: {
            ...element.extraAttributes,
            imageUrl: base64,
            preserveOriginalSize,
            label,
          },
          height: preserveOriginalSize ? Math.max(naturalHeight, 80) : 80,
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
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => {
            const id = "label-input";
            return (
              <FormItem>
                <FormLabel htmlFor={id}>Label</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={id}
                    placeholder="Enter label for the picture"
                    onBlur={form.handleSubmit(applyChanges)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The label of the field. <br /> It will be displayed above the field
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
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
          <FormLabel>Or paste image URL</FormLabel>
          <Input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="w-full border rounded px-3 py-1"
            defaultValue={form.getValues("imageUrl")}
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (!url) return;

              const img = new Image();
              img.crossOrigin = "anonymous"; // importante para carregar imagens externas

              img.onload = () => {
                const naturalHeight = img.naturalHeight;
                const preserveOriginalSize = form.getValues("preserveOriginalSize");

                updateElement(element.id, {
                  ...element,
                  extraAttributes: {
                    ...element.extraAttributes,
                    imageUrl: url,
                    preserveOriginalSize,
                  },
                  height: preserveOriginalSize ? Math.max(naturalHeight, 200) : 200,
                });

                form.setValue("imageUrl", url, { shouldDirty: true });
              };

              img.onerror = () => {
                console.error("Could not load image from URL:", url);
              };

              img.src = url;
            }}
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
              checked={!!form.watch("repeatOnPageBreak")}
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
        <div className="space-y-1">
          <Label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!form.watch("preserveOriginalSize")}
              onChange={(e) =>
                form.setValue("preserveOriginalSize", e.target.checked, {
                  shouldDirty: true,
                })
              }
              className="mr-2"
            />
            <span>Keep original image size</span>
          </Label>
        </div>
      </form>
    </Form>
  );
}
