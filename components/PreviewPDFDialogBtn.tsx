import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import useDesigner from "./hooks/useDesigner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { FormElements } from "./FormElements";
import type { FormElementInstance } from "./FormElements";

function PreviewPDFDialogBtn({ formName }: { formName: string }) {
    const { elements } = useDesigner();
    const documentNumber = formName || "Unknown Document Number";
    const pages: FormElementInstance[][] = [];
    let currentPage: FormElementInstance[] = [];

    const repeatedElements = elements.filter(
        (el) => el.extraAttributes?.repeatOnPageBreak
    );

    for (const element of elements) {
        if (element.type === "PageBreakField") {
            if (pages.length === 0) {
                pages.push([...currentPage]);
            } else {
                pages.push([...repeatedElements, ...currentPage]);
            }
            currentPage = [];
        } else {
            currentPage.push(element);
        }
    }

    if (currentPage.length > 0) {
        if (pages.length === 0) {
            pages.push([...currentPage]);
        } else {
            pages.push([...repeatedElements, ...currentPage]);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"} className="gap-2 ">
                    <MdPreview className="h-6 w-6" />
                    Preview PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col p-0 gap-0">
                <div className="px-4 py-2 border-b flex-shrink-0">
                    <p className="text-lg font-bold text-muted-foreground">PDF preview</p>
                    <p className="text-sm text-muted-foreground">
                        This is how your form will look like in the final PDF.
                    </p>
                </div>
                <DialogTitle className="sr-only">
                    Preview Button
                </DialogTitle>
                <DialogDescription className="sr-only">
                    This dialog contains the details of Preview Button.
                </DialogDescription>
                <div
                    className="bg-accent flex flex-col items-center justify-start p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)] overflow-y-auto table-cell-wrap"
                    style={{ flexGrow: 1 }}
                >
                    <div className="flex flex-col items-center gap-8 w-full">
                        {pages.map((pageElements, pageIndex) => (
                            <div
                                key={pageIndex}
                                className="w-[1000px] bg-white p-8 border border-gray-300 relative"
                                style={{
                                    maxHeight: "1250px",
                                    minHeight: "1250px",
                                    paddingBottom: "40px",
                                }}
                            >
                                {pageElements.map((element: FormElementInstance) => {

                                    const FormComponent = FormElements[element.type].formComponent;
                                    return (
                                        <FormComponent
                                            key={element.id + "-page" + pageIndex}
                                            elementInstance={element}
                                            pdf={true}
                                        />
                                    );
                                })}

                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                                    Page {pageIndex + 1} / {pages.length}
                                </div>
                                <div className="absolute top-5 right-90 text-sm text-muted-foreground">
                                    {documentNumber}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}

export default PreviewPDFDialogBtn;
