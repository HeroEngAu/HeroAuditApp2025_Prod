import { GetFormSubmissionById } from "../../../actions/form";
import ViewSubmissionClient from "../../../components/viewSubmissionDialog";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";

Amplify.configure(outputs);

type Params = Promise<{ submissionID: string }>;

export default async function ViewSubmissionPage({ params }: { params: Params }) {
  const { submissionID } = await params;

  const submission = await GetFormSubmissionById(submissionID);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const formContent = JSON.parse(typeof submission.content === "string" ? submission.content : "{}");
  const responses = formContent.responses ?? {};
  const elements = formContent.formContent;

  return (
    <ViewSubmissionClient
      submissionID={submissionID}
      elements={elements}
      responses={responses}
    />
  );
}
