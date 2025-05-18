"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { Dialog, DialogContent } from "./ui/dialog";
import SubmissionRenderer from "../components/submissionRenderer";



interface ViewSubmissionClientProps {
  elements: any[];
  responses: Record<string, any>;
}

export default function ViewSubmissionClient({ elements, responses }: ViewSubmissionClientProps) {
=======
import { Dialog, DialogContent, DialogDescription, DialogTitle} from "./ui/dialog";
import SubmissionRenderer from "../components/submissionRenderer";

interface ViewSubmissionClientProps {
  elements: any[];
  responses: Record<string, any>;
  submissionID: string;
}

export default function ViewSubmissionClient({ submissionID, elements, responses }: ViewSubmissionClientProps) {
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    router.back();
  };
<<<<<<< HEAD

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="h-screen max-h-screen justify-center max-w-full flex items-center  p-0">
        <div className="w-full h-full flex flex-col justify-center overflow-y-auto rounded-2xl bg-background p-8">
          <SubmissionRenderer elements={elements} responses={responses} />
        </div>
        {/*<div className="mt-4">
           Render PDFRenderer component here with the form data 
          <PDFRenderer pdfUrl="/Template.pdf" formData={elements} />
        </div>*/}
      </DialogContent>

    </Dialog>
  );

=======
  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="h-screen max-h-screen justify-center max-w-full flex items-center p-0"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"  // Ensure aria-describedby links to the description ID
      >
        <div className="w-full h-full flex flex-col justify-center overflow-y-auto rounded-2xl bg-background p-8">
          {/* Title for the Dialog */}
          <DialogTitle className="sr-only">
            View Submission Details
          </DialogTitle>

          {/* Description for the Dialog */}
          <DialogDescription className="sr-only">
            This dialog contains the details of the submitted form, including responses and form elements.
          </DialogDescription>

        <SubmissionRenderer submissionID={submissionID} elements={elements} responses={responses} />
        </div>
      </DialogContent>
    </Dialog>
  );
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
}
