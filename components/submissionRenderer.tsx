import { useEffect, useState } from "react";
import { FormElementInstance } from "./FormElements";
import { Button } from "./ui/button";
import { GetFormNameFromSubmissionId } from "../actions/form";
import PDFDocument from "./PDFComponent";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FormElements } from "./FormElements";
import { Cross2Icon } from "@radix-ui/react-icons";

interface Props {
  elements: FormElementInstance[];
  responses: { [key: string]: unknown };
  submissionID: string;
}

export default function SubmissionRenderer({ submissionID, elements, responses }: Props) {
  const [formName, setFormName] = useState<string>("Loading...");
  const [pageGroups, setPageGroups] = useState<FormElementInstance[][]>([]);

  useEffect(() => {
    const fetchFormName = async () => {
      try {
        const result = await GetFormNameFromSubmissionId(submissionID);
        setFormName(result.formName || "Untitled Form");
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

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Top Bar */}
      <div className="fixed h-24 top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 border-b bg-white shadow-sm w-full">
        {/* Left: Export Button */}
        <div className="self-end">
          <PDFDownloadLink
            document={
              <PDFDocument
                elements={pageGroups}
                responses={responses}
                formName={formName}
              />
            }
            fileName={`${formName}.pdf`}
          >
            {({ loading }) => (
              <Button size="sm" className="h-8 px-3 ">
                {loading ? "Preparing..." : "Export as PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        {/* Right: Close Button */}
        <button
          onClick={() => window.history.back()}
          className="self-end flex items-center justify-center w-8 h-8 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Cross2Icon className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="w-full flex flex-col gap-4 bg-background rounded-2xl p-8 pt-8 overflow-y-auto" style={{ paddingTop: "94px", maxHeight: "100vh" }}>
        {pageGroups.map((group, idx) => (
          <div key={idx} className="pdf-page mb-8">
            {group
              .filter(el => {
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
