import { useState } from "react";
import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import useDesigner from "./hooks/useDesigner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PDFDocument from "./PDFComponent";
import { FormElementInstance } from "./FormElements";
import { Cross2Icon } from "@radix-ui/react-icons";
import { pdf } from "@react-pdf/renderer";

function PreviewPDFDialogBtn({ formName }: { formName: string }) {
  const { elements, setSelectedElement } = useDesigner();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const documentNumber = formName || "Unknown Document Number";

  const generatePDF = async () => {
    setSelectedElement(null);

    const groups: FormElementInstance[][] = [];
    const repeatables: FormElementInstance[] = [];
    let current: FormElementInstance[] = [];
    let firstPage = true;

    elements.forEach((el) => {
      if (el.type === "PageBreakField") {
        if (current.length > 0) {
          groups.push(firstPage ? [...current] : [...repeatables, ...current]);
          current = [];
          firstPage = false;
        }
      } else {
        if (el.extraAttributes?.repeatOnPageBreak && firstPage) {
          repeatables.push(el);
        }
        current.push(el);
      }
    });

    if (current.length > 0) {
      groups.push(firstPage ? [...current] : [...repeatables, ...current]);
    }

    const blob = await pdf(
      <PDFDocument elements={groups} responses={{}} formName={documentNumber} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setPdfUrl(null)}>
      <DialogTrigger asChild onClick={generatePDF}>
        <Button variant="outline" className="gap-2">
          <MdPreview className="h-6 w-6" />
          Preview PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col p-0 pt-8 gap-0">
        <div className="flex items-start justify-between px-4 py-4 border-b flex-shrink-0">
          <div>
            <p className="text-lg font-bold text-muted-foreground">PDF preview</p>
            <p className="text-sm text-muted-foreground">
              This is how your form will look like in the final PDF.
            </p>
          </div>
          <DialogClose className="mt-2 sm:mt-4 md:mt-8 relative rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <DialogTitle className="sr-only">Preview Button</DialogTitle>
        <DialogDescription className="sr-only">
          This dialog contains the details of Preview Button.
        </DialogDescription>

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="PDF Preview"
          />
        ) : (
          <p className="text-center mt-8">Generating PDF...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PreviewPDFDialogBtn;
