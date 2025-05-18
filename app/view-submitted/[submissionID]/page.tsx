import { GetFormSubmissionById } from "../../../actions/form";
import ViewSubmissionClient from "../../../components/viewSubmissionDialog";
<<<<<<< HEAD
=======
import { Amplify } from "aws-amplify"
import outputs from "../../../../amplify_outputs.json"

Amplify.configure(outputs)
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45

interface SubmissionPageProps {
  params: {
    submissionID: string;
  };
}

export default async function ViewSubmissionPage({ params }: SubmissionPageProps) {
  const { submissionID } = await params;
  const submission = await GetFormSubmissionById(submissionID);

  if (!submission) {
    throw new Error("Submission not found");
  }
<<<<<<< HEAD

=======
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
  const formContent = JSON.parse(typeof submission.content === "string" ? submission.content : "{}");
  const responses = formContent.responses ?? {};
  const elements = formContent.formContent;

<<<<<<< HEAD
  return <ViewSubmissionClient elements={elements} responses={responses} />;
=======
  return <ViewSubmissionClient submissionID= {submissionID} elements={elements} responses={responses} />;
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
}
