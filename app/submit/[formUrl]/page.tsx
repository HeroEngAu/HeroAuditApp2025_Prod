import { GetFormContentByUrl, ResumeTest } from "../../../actions/form";
import { FormElementInstance } from "../../../components/FormElements";
import FormSubmitComponent from "../../../components/FormSubmitComponent";
import ResumeTestRenderer from "../../../components/ResumeTestRenderer";

type Params = Promise<{ formUrl: string }>;
type SearchParams = Promise<{ resume?: string; formtag2Id?: string }>;

export default async function SubmitPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { formUrl } = await params;
  const { resume, formtag2Id } = await searchParams;

  const isResume = !!resume;

  if (isResume) {
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
        formtag2Id={formtag2Id}
        formId={formId ?? ""}
        elements={elements as FormElementInstance[]}
        responses={responses}
      />
    );
  }
  console.log("formURL page", formUrl)
  const form = await GetFormContentByUrl(formUrl);
  if (!form) {
    throw new Error("Form not found.");
  }

  const formContent = JSON.parse(form.content ?? "[]") as FormElementInstance[];
  return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}
