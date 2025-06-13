import { FormElementInstance } from "./FormElements"; // ou de onde vem esse tipo
import { FormElements } from "./FormElements";

interface ViewFormClientProps {
  content: string;
}

export default function ViewFormClient({ content }: ViewFormClientProps) {
let elements: FormElementInstance[] = [];
try {
  elements = JSON.parse(content);
} catch {
  elements = [];
}

  return (
    <div className="bg-accent flex flex-col flex-grow items-center justify-center p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)] overflow-y-auto">
          <div className="max-w-[1500px] flex flex-col gap-4 flex-grow bg-background w-full h-full rounded-2xl p-8 overflow-y-auto">
      {elements.length === 0 ? (
        <p>It's empty or invalid.</p>
      ) : (
        elements.map((element) => {
          const FormComponent = FormElements[element.type].formComponent;
          return <FormComponent key={element.id} elementInstance={element} />;
        })
      )}
    </div>
    </div>
  );
}

