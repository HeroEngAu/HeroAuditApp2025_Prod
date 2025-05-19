import { Button } from "./ui/button";
import { MdPreview } from "react-icons/md";
import useDesigner from "./hooks/useDesigner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { FormElements } from "./FormElements";

function PreviewDialogBtn() {
  const { elements } = useDesigner();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-2">
          <MdPreview className="h-6 w-6" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col flex-grow p-0 gap-0">
        <div className="px-4 py-2 border-b">
          <p className="text-lg font-bold text-muted-foreground">
            Form preview
          </p>
          <p className="text-sm text-muted-foreground">
            This is how your form will look like to your users.
          </p>
        </div>
        <div className="bg-accent flex flex-col flex-grow items-center justify-center p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)] overflow-y-auto">
          <div className="max-w-[1500px] flex flex-col gap-4 flex-grow bg-background w-full h-full rounded-2xl p-8 overflow-y-auto">
            {elements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return (
                <FormComponent key={element.id} elementInstance={element} />
              );
            })}
          </div>
        </div>
        <DialogTitle className="sr-only">
          Preview Button
        </DialogTitle>
        <DialogDescription className="sr-only">
          This dialog contains the details of Preview Button.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewDialogBtn;
