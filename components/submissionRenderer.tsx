import { useEffect, useState } from "react";
import { FormElementInstance } from "./FormElements";
import { Button } from "./ui/button";
import { GetFormNameFromSubmissionId } from "../actions/form";
import PDFDocument from "./PDFComponent";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FormElements } from "./FormElements";

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
    <div className="flex flex-col items-center">
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
          <Button className="fixed top-4 left-4 z-50">
            {loading ? "Preparing PDF..." : "Export as PDF"}
          </Button>
        )}
      </PDFDownloadLink>

      <div className="w-full flex flex-col gap-4 bg-background rounded-2xl p-8 pt-8 overflow-y-auto" style={{ maxHeight: '100vh' }}>
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
