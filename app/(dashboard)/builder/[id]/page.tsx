import { GetFormById } from "../../../../actions/form";
import FormBuilder from "../../../../components/FormBuilder";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

export default async function BuilderPage(props: { params: { id: string } }) {
  const { params } = props;
  const id = params.id;

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
