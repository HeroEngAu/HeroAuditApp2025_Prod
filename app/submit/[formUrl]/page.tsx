import { GetFormContentByUrl, ResumeTest } from "../../../actions/form";
import { FormElementInstance } from "../../../components/FormElements";
import FormSubmitComponent from "../../../components/FormSubmitComponent";
import ResumeTestRenderer from "../../../components/ResumeTestRenderer";
<<<<<<< HEAD

=======
import { Amplify } from "aws-amplify"
import outputs from "../../../../amplify_outputs.json"

Amplify.configure(outputs)

>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
interface Props {
  params: { formUrl: string };
  searchParams: { resume?: string; formtag2Id?: string };
}

export default async function SubmitPage({ params, searchParams }: Props) {

  const { formUrl } = await params;
  const { resume } = await searchParams;

  const isResume = resume ;
  if (isResume) {
    const { formtag2Id } = await searchParams
    
    if (!formtag2Id) {
      throw new Error("formTag2Id not found in searchParams.");
    }

    const resumeData = await ResumeTest(formtag2Id);
    if (!resumeData) {
      throw new Error("Erro to resume test.");
    }
    
    const { elements, responses, formId } = resumeData;

    return (
      <ResumeTestRenderer
      formtag2Id = {formtag2Id ?? ""}
      formId={formId ?? ""}
        elements={elements as FormElementInstance[]}
        responses={responses}
      />
    );

  }

  const form = await GetFormContentByUrl(formUrl);
  if (!form) {
    throw new Error("Form not found.");
  }

  const formContent = JSON.parse(form.content ?? "[]") as FormElementInstance[];
  return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}
