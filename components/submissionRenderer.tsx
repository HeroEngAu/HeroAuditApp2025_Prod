<<<<<<< HEAD
import { useRef } from "react";
=======
"use client";
import { useRef, useEffect, useState } from "react";
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
<<<<<<< HEAD
=======
import { GetFormNameFromSubmissionId } from "../actions/form";
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45

interface Props {
  elements: FormElementInstance[];
  responses: { [key: string]: any };
<<<<<<< HEAD
}

export default function SubmissionRenderer({ elements, responses }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    const originalClass = contentRef.current.className;
    contentRef.current.className = originalClass + " max-w-[1000px] mx-auto";

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const element = contentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    contentRef.current.className = originalClass;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgHeightMM = canvas.height * 0.264583;
    const imgWidthMM = canvas.width * 0.264583;
    const ratio = Math.min(pdfWidth / imgWidthMM, 1);
    const adjustedWidth = imgWidthMM * ratio;
    const adjustedHeight = imgHeightMM * ratio;

    let position = 0;

    while (position < adjustedHeight) {
      const canvasPage = document.createElement("canvas");
      canvasPage.width = canvas.width;
      canvasPage.height = (pdfHeight / 0.264583) / ratio;

      const ctx = canvasPage.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        canvas,
        0,
        (position / 0.264583) / ratio,
        canvas.width,
        canvasPage.height,
        0,
        0,
        canvas.width,
        canvasPage.height
      );

      const pageImgData = canvasPage.toDataURL("image/png");
      if (position > 0) pdf.addPage();
      pdf.addImage(pageImgData, "PNG", 0, 0, adjustedWidth, pdfHeight);

      position += pdfHeight;
=======
  submissionID: string;
}

export default function SubmissionRenderer({ submissionID, elements, responses }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [formName, setFormName] = useState<string | null>(null); // Use state to store form name

  // Fetch form name when submissionID changes
  useEffect(() => {
    const fetchFormName = async () => {
      try {
        const result = await GetFormNameFromSubmissionId(submissionID);
        setFormName(result.formName); // Store form name in state
      } catch (error) {
        console.error("Error fetching form name:", error);
      }
    };

    fetchFormName();
  }, [submissionID]); // Only fetch when submissionID changes

  // Handle page load to make content visible
  useEffect(() => {
    const handlePageLoad = () => {
      if (contentRef.current) {
        contentRef.current.style.visibility = "visible";
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("load", handlePageLoad);
    return () => {
      window.removeEventListener("load", handlePageLoad);
    };
  }, []);

  // Generate PDF with formName included
  const generatePDF = async () => {
    if (!contentRef.current || !formName) return; // Ensure formName is available

    const pageGroups: FormElementInstance[][] = [];
    let currentGroup: FormElementInstance[] = [];
    let repeatables: FormElementInstance[] = [];

    let firstPage = true;

    elements.forEach((el) => {
      if (el.type === "PageBreakField") {
        if (currentGroup.length > 0) {
          pageGroups.push(firstPage ? [...currentGroup] : [...repeatables, ...currentGroup]);
          firstPage = false;
        }
        currentGroup = [];
      } else {
        if (el.extraAttributes?.repeatOnPageBreak) {
          repeatables.push(el);
        }
        currentGroup.push(el);
      }
    });

    if (currentGroup.length > 0) {
      pageGroups.push(firstPage ? [...currentGroup] : [...repeatables, ...currentGroup]);
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    let currentPage = 1;

    const documentNumber = formName || "Unknown Document Number"; // Use formName here

    for (let i = 0; i < pageGroups.length; i++) {
      const group = pageGroups[i];
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "1000px";
      tempContainer.style.padding = "2rem";
      tempContainer.style.backgroundColor = "white";

      group.forEach((el) => {
        const FormComponent = FormElements[el.type].formComponent;
        const value = responses[el.id];

        const wrapper = document.createElement("div");
        const elementRoot = (
          <FormComponent
            elementInstance={el}
            defaultValue={value}
            isInvalid={false}
            submitValue={() => { }}
            pdf={true}
          />
        );

        import("react-dom/client").then(({ createRoot }) => {
          createRoot(wrapper).render(elementRoot);
        });

        tempContainer.appendChild(wrapper);
      });

      document.body.appendChild(tempContainer);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        removeContainer: true,
        ignoreElements: (el) => el.tagName === "BUTTON",
      });

      const imgHeightMM = canvas.height * 0.264583;
      const imgWidthMM = canvas.width * 0.264583;
      const ratio = Math.min(pdfWidth / imgWidthMM, 1);
      const adjustedWidth = imgWidthMM * ratio;
      const adjustedHeight = imgHeightMM * ratio;

      const imgData = canvas.toDataURL("image/png");

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, adjustedWidth, adjustedHeight);
      pdf.setFontSize(10);
      pdf.text(`${documentNumber}`, 10, 10);
      const pageNumberText = `Page ${currentPage} of ${pageGroups.length}`;
      pdf.setFontSize(10);
      pdf.text(pageNumberText, pdfWidth / 2 - pdf.getStringUnitWidth(pageNumberText) * pdf.internal.scaleFactor / 2, pdf.internal.pageSize.height - 10);

      currentPage++;

      document.body.removeChild(tempContainer);
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
    }

    pdf.save("submission.pdf");
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={generatePDF}
        className="fixed top-4 left-4 z-50 mb-4 px-4 py-2 rounded"
      >
        Export as PDF
      </Button>

      <div
        ref={contentRef}
<<<<<<< HEAD
        className="w-full flex flex-col gap-4 flex-grow bg-background h-full rounded-2xl p-8 overflow-y-auto"
      >
        {elements.map((element) => {
          const FormComponent = FormElements[element.type].formComponent;
          const value = responses[element.id];

          return (
            <div key={element.id} className="pointer-events-none opacity-100">
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
    </div>
  );
}
=======
        className="w-full flex flex-col gap-4 flex-grow bg-background h-full rounded-2xl p-8 pt-8 overflow-y-auto"
        style={{
          visibility: "hidden",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {(() => {
          const pageGroups: FormElementInstance[][] = [];
          let currentGroup: FormElementInstance[] = [];

          elements.forEach((el) => {
            if (el.type === "PageBreakField") {
              if (currentGroup.length > 0) pageGroups.push(currentGroup);
              currentGroup = [];
            } else {
              currentGroup.push(el);
            }
          });
          if (currentGroup.length > 0) pageGroups.push(currentGroup);

          return pageGroups.map((group, idx) => (
            <div key={idx} className="pdf-page mb-8">
              {group.map((element) => {
                const FormComponent = FormElements[element.type].formComponent;
                const value = responses[element.id];
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
          ));
        })()}
      </div>
    </div>
  );
}
>>>>>>> 8c057302bc785c4f6ab2b350f523a8b4bf81cd45
