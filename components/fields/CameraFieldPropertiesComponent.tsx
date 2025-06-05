import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CustomInstance } from "./CameraField";
import { useDesigner } from "../context/useDesigner";
import { FormElementInstance } from "../FormElements";

const propertiesSchema = z.object({
  label: z.string().optional(),
});

type PropertiesFormSchema = z.infer<typeof propertiesSchema>;

export function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const instance = elementInstance as CustomInstance;
  const { updateElement } = useDesigner();

  const form = useForm<PropertiesFormSchema>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: {
      label: instance.extraAttributes.label ?? "",
    },
  });

  function applyChanges(values: PropertiesFormSchema) {
    updateElement(instance.id, {
      ...instance,
      extraAttributes: {
        ...instance.extraAttributes,
        label: values.label || "",
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
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter label for the camera"
                  onBlur={form.handleSubmit(applyChanges)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                This label will appear above the camera field.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
