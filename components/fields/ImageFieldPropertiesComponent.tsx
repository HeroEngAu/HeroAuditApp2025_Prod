"use client";

import {
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
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
import React from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';


type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;
export function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
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
      width: element.extraAttributes.width ,
    },
  });


  useEffect(() => {
    form.reset(element.extraAttributes as propertiesFormSchemaType);
  }, [element, form]);

useEffect(() => {
  const imageUrl = element.extraAttributes?.imageUrl;
  if (!imageUrl || imageUrl.startsWith("http")) return;

  const loadImage = async () => {
    try {
      const { url } = await getUrl({ path: imageUrl }); // 🔑 gera URL real
      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });

        const preserveOriginalSize = form.getValues("preserveOriginalSize");
        const width = preserveOriginalSize ? img.naturalWidth : form.getValues("width") || 200;
        const height = preserveOriginalSize ? img.naturalHeight : (img.naturalHeight / img.naturalWidth) * width;

        updateElement(element.id, {
          ...element,
          extraAttributes: {
            ...element.extraAttributes,
            preserveOriginalSize,
            position: form.getValues("position"),
            repeatOnPageBreak: form.getValues("repeatOnPageBreak"),
            label: form.getValues("label"),
            width,
            height,
          },
        });

        form.setValue("width", width, { shouldDirty: false });
      };
      img.crossOrigin = "anonymous";
      img.src = url.toString(); // ✅ correto agora
    } catch (err) {
      console.error("Failed to load image from S3", err);
    }
  };

  loadImage();
}, [element.extraAttributes?.imageUrl]);

  function applyChanges(values: propertiesFormSchemaType) {
    const { imageUrl, position, repeatOnPageBreak, preserveOriginalSize, label, width } = values;
    if (!naturalSize) return;

    const ratio = naturalSize.height / naturalSize.width;
    const height = preserveOriginalSize ? naturalSize.height : width * ratio;

    updateElement(element.id, {
      ...element,
      extraAttributes: {
        imageUrl,
        position,
        repeatOnPageBreak,
        preserveOriginalSize,
        label,
        width,
        height,
      },
    });

    form.setValue("height", height, { shouldDirty: false });
  }


async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const key = `public/uploads/${Date.now()}-${file.name}`;
  const label = element.extraAttributes?.label;

  try {
    await uploadData({
      path: key,
      data: file,
      options: {
        contentType: file.type,
      },
    }).result;

    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const preserveOriginalSize = form.getValues("preserveOriginalSize");
      const finalWidth = preserveOriginalSize ? width : form.getValues("width") || 200;
      const finalHeight = preserveOriginalSize ? height : (height / width) * finalWidth;
      const position = form.getValues("position");

      updateElement(element.id, {
        ...element,
        extraAttributes: {
          ...element.extraAttributes,
          imageUrl: key, // 🔑 S3 path
          preserveOriginalSize,
          label,
          width: finalWidth,
          height: finalHeight,
          position,
        },
      });

      form.setValue("width", finalWidth, { shouldDirty: false });
      form.setValue("height", finalHeight, { shouldDirty: false });
    };

    img.src = URL.createObjectURL(file); // 👈 carrega localmente só pra medir
  } catch (err) {
    console.error("S3 Upload Error", err);
  }
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
                  The label of the field. It will be displayed above the field
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
            onBlur={async (e) => {
              const urlInput = e.target.value;
              if (!urlInput) return;

              try {
                const { url } = await getUrl({ path: urlInput });

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  const width = img.naturalWidth;
                  const height = img.naturalHeight;

                  const preserveOriginalSize = form.getValues("preserveOriginalSize");
                  const finalWidth = preserveOriginalSize ? width : form.getValues("width") || 200;
                  const finalHeight = preserveOriginalSize ? height : (height / width) * finalWidth;

                  updateElement(element.id, {
                    ...element,
                    extraAttributes: {
                      ...element.extraAttributes,
                      imageUrl: urlInput,
                      preserveOriginalSize,
                      width: finalWidth,
                      height: finalHeight,
                    },
                  });

                  setNaturalSize({ width, height });

                  form.setValue("imageUrl", urlInput, { shouldDirty: true });
                  form.setValue("width", finalWidth, { shouldDirty: false });
                  form.setValue("height", finalHeight, { shouldDirty: false });
                };

                img.onerror = () => {
                  console.error("Could not load image from URL:", url);
                };

                img.src = url.toString();
              } catch (err) {
                console.error("getUrl failed", err);
              }
            }}

          />
          <FormDescription>
            Image shall be .png/.jpeg.
          </FormDescription>
        </div>

        <div className="space-y-1">
          <FormLabel>Image Position</FormLabel>
          <Select
            onValueChange={(value) => {
              form.setValue("position", value as "left" | "center" | "right", { shouldDirty: true });
              applyChanges(form.getValues()); // ✅ chama a função de atualização
            }}
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
              onChange={(e) => {
                form.setValue("repeatOnPageBreak", e.target.checked, { shouldDirty: true });
                applyChanges(form.getValues()); // ✅
              }}
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
              onChange={(e) => {
                form.setValue("preserveOriginalSize", e.target.checked, { shouldDirty: true });
                applyChanges(form.getValues()); // ✅
              }}
              className="mr-2"
            />
            <span>Keep original image size</span>
          </Label>
        </div>
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image width (px): {field.value}</FormLabel>
              <FormControl>
                <input
                  type="range"
                  min={10}
                  max={naturalSize ? naturalSize.width * 2 : 1000}
                  {...field}
                  onChange={(e) => {
                    const newWidth = Number(e.target.value);
                    field.onChange(newWidth);
                    if (naturalSize) {
                      const ratio = naturalSize.height / naturalSize.width;
                      const newHeight = newWidth * ratio;
                      form.setValue("height", newHeight, { shouldDirty: true });
                    }
                    applyChanges(form.getValues()); // ✅
                  }}
                  style={{
                    width: "50%",
                    height: "10px",
                    cursor: "pointer",
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <input type="hidden" {...form.register("height")} />
      </form>
    </Form>
  );
}
