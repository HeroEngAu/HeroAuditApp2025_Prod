import { useState } from "react";
import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import useDesigner from "./hooks/useDesigner";
import PDFDocument from "./PDFComponent";
import { FormElementInstance } from "./FormElements";
import { pdf } from "@react-pdf/renderer";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

function PreviewPDFDialogBtn({ formName, revision }: { formName: string, revision: number }) {
  const { elements, setSelectedElement } = useDesigner();
  const [loading, setLoading] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

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
      <PDFDocument
        elements={groups}
        responses={{}}
        formName={formName || "Unknown Document Number"}
        revision={revision}
        orientation={orientation}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setLoading(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={loading}>
          <MdPreview className="h-6 w-6" />
          {loading ? "Generating..." : "Preview PDF"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3">
        <div className="text-sm font-medium">Select Page Orientation</div>
        <Select value={orientation} onValueChange={(v) => setOrientation(v as "portrait" | "landscape")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full" onClick={generateAndOpenPDF} disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default PreviewPDFDialogBtn;
