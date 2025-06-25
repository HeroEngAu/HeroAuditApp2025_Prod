import { resolveImageFields } from "./resolveImageFields";
import { FormElementInstance } from "./FormElements";

export async function prepareResolvedElements(elements: FormElementInstance[][]): Promise<FormElementInstance[][]> {
  return await Promise.all(elements.map(group => resolveImageFields(group)));
}