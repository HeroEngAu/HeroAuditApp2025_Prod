import { useEffect, useState } from "react";
import { FormElementInstance } from "./FormElements";
import { Button } from "./ui/button";
import { GetFormNameFromSubmissionId } from "../actions/form";
import PDFDocument from "./PDFComponent";
import { pdf } from "@react-pdf/renderer";
import { FormElements } from "./FormElements";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

interface Props {
  elements: FormElementInstance[];
  responses: { [key: string]: unknown };
  submissionID: string;
}

export default function SubmissionRenderer({ submissionID, elements, responses }: Props) {
  const [formName, setFormName] = useState<string>("Loading...");
  const [equipmentName, setEquipmentName] = useState<string>("Loading...");
  const [equipmentTag, setEquipmentTag] = useState<string>("Loading...");
  const [revision, setRevision] = useState<number | string>("Loading...");
  const [docNumber, setDocNumber] = useState<string>("Loading...");
  const [docNumberRevision, setDocNumberRevision] = useState<number | string>("Loading...");
  const [pageGroups, setPageGroups] = useState<FormElementInstance[][]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"A4" | "A3">("A4");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFormName = async () => {
      try {
        const result = await GetFormNameFromSubmissionId(submissionID);
        setFormName(result.formName || "Untitled Form");
        setRevision(result.revision || "0");
        setDocNumber(result.docNumber || "Untitled Form");
        setDocNumberRevision(result.docNumberRevision || "0");
        setEquipmentName(result.equipmentName || "Untitled Equipment");
        setEquipmentTag(result.equipmentTag || "Untitled Tag");
      } catch {
        setFormName("Unknown");
      }
    };
    fetchFormName();
  }, [submissionID]);

  useEffect(() => {
    const groups: FormElementInstance[][] = [];
    let current: FormElementInstance[] = [];
    const repeatables: FormElementInstance[] = [];

    let firstPage = true;

    elements.forEach((el) => {
      if (el.type === "PageBreakField") {
        if (current.length > 0) {
          groups.push(firstPage ? [...current] : [...repeatables, ...current]);
          firstPage = false;
        }
        current = [];
      } else {
        if (el.extraAttributes?.repeatOnPageBreak) repeatables.push(el);
        current.push(el);
      }
    });

    if (current.length > 0) {
      groups.push(firstPage ? [...current] : [...repeatables, ...current]);
    }

    setPageGroups(groups);
  }, [elements]);

  const handleExportPDF = async () => {
    setLoading(true);
    const blob = await pdf(
      <PDFDocument
        elements={pageGroups}
        responses={responses}
        formName={formName}
        revision={revision}
        orientation={orientation}
        pageSize={pageSize}
        docNumber={docNumber}
        docNumberRevision={docNumberRevision}
        equipmentName={equipmentName}
        equipmentTag={equipmentTag}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = `${formName} REV. ${revision}_${docNumber} REV. ${docNumberRevision}.pdf`;
    link.download = fileName;
    link.click();
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Top Bar */}
      <div className="fixed h-24 top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 border-b bg-white shadow-sm w-full">
        {/* Left: Export with config */}
        <div className="self-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="h-8 px-3 bg-background text-foreground border border-border hover:bg-muted">
                {loading ? "Preparing..." : "Export as PDF"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-3">
              <div className="text-sm font-medium">Select Page Configuration</div>
              <div className="space-y-2">
                <Select value={orientation} onValueChange={(v) => setOrientation(v as "portrait" | "landscape")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={pageSize} onValueChange={(v) => setPageSize(v as "A4" | "A3")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Page Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleExportPDF} disabled={loading}>
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm font-semibold text-center text-muted-foreground truncate max-w-[60%]">
          {formName} REV. {revision} | {docNumber} REV. {docNumberRevision}
        </div>

        {/* Right: Close Button */}
        <Button
          onClick={() => window.history.back()}
          className="self-end flex items-center justify-center w-8 h-8 rounded-sm 
          opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 
          focus:ring-ring text-foreground bg-background border border-border 
          font-bold text-lg hover:bg-neutral-700 dark:hover:bg-neutral-300 dark:hover:text-black"
        >
          X
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Form Preview */}
      <div
        className="w-full flex flex-col gap-4 bg-background rounded-2xl p-8 pt-8 overflow-y-auto"
        style={{ paddingTop: "94px", maxHeight: "100vh" }}
      >

        {pageGroups.map((group, idx) => (
          <div key={idx} className="pdf-page mb-8">
            {group
              .filter((el) => {
                const shouldRepeat = el.extraAttributes?.repeatOnPageBreak === true;
                return idx === 0 || !shouldRepeat;
              })
              .map((element) => {
                const FormComponent = FormElements[element.type].formComponent;
                const rawValue = responses[element.id];
                const value = typeof rawValue === "string" ? rawValue : undefined;

                return (
                  <div key={element.id}>
                    <FormComponent
                      elementInstance={element}
                      defaultValue={value}
                      isInvalid={false}
                      submitValue={() => { }}
                      readOnly={true}
                    />
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
