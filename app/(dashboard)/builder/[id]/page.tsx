import { GetFormById } from "../../../../actions/form";
import FormBuilder from "../../../../components/FormBuilder";

type BuilderPageParams = {
  id: string;
};

export default async function BuilderPage({
  params,
}: {
  params: Promise<BuilderPageParams>;
}) {
  const { id } = await params;

  const formData = await GetFormById(id);

  if (!formData || !formData.form) {
    throw new Error("Form not found");
  }

  const cleanForm = JSON.parse(JSON.stringify(formData));

  return (
    <FormBuilder
      formID={id}
      form={cleanForm.form}
      equipmentName={cleanForm.equipmentName}
      clientName={cleanForm.clientName}
      formName={cleanForm.form.name ?? "Default Form Name"}
      revision={cleanForm.revision}
    />
  );
}
