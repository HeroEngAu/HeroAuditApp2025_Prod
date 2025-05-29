import { useState } from "react";
import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import useDesigner from "./hooks/useDesigner";
import PDFDocument from "./PDFComponent";
import { FormElementInstance } from "./FormElements";
import { pdf } from "@react-pdf/renderer";

function PreviewPDFDialogBtn({ formName }: { formName: string }) {
  const { elements, setSelectedElement } = useDesigner();
  const [loading, setLoading] = useState(false);
  const documentNumber = formName || "Unknown Document Number";

  const generateAndOpenPDF = async () => {
    setSelectedElement(null);
    setLoading(true);

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
    window.open(url, "_blank");
    setLoading(false);
  };

  return (
    <Button variant="outline" className="gap-2" onClick={generateAndOpenPDF} disabled={loading}>
      <MdPreview className="h-6 w-6" />
      {loading ? "Generating..." : "Preview PDF"}
    </Button>
  );
}

export default PreviewPDFDialogBtn;
