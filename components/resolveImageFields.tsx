import { getUrl } from "aws-amplify/storage";
import { FormElementInstance } from "./FormElements";

export async function resolveImageFields(
  elements: FormElementInstance[]
): Promise<FormElementInstance[]> {
  const resolved = await Promise.all(
    elements.map(async (el) => {
      if (el.type === "ImageField") {
        const key = el.extraAttributes?.imageUrl;
        if (key && !key.startsWith("http")) {
          try {
            const { url } = await getUrl({ path: key });
            return {
              ...el,
              extraAttributes: {
                ...el.extraAttributes,
                imageUrl: url.toString(),
              },
            };
          } catch {
            return el;
          }
        }
      }
      return el;
    })
  );

  return resolved;
}
