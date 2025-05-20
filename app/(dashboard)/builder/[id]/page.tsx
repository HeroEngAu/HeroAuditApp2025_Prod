import { GetFormById } from "../../../../actions/form";
import FormBuilder from "../../../../components/FormBuilder";

type BuilderPageProps = {
  params: {
    id: string;
  };
};

export default async function BuilderPage({ params }: BuilderPageProps) {
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
      projectName={cleanForm.projectName}
      clientName={cleanForm.clientName}
      formName={cleanForm.form.name ?? "Default Form Name"}
    />
  );
}

