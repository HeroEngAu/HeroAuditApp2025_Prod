import { FormElement } from "./FormElements";
import { useDraggable } from "@dnd-kit/core";
import { Text, Flex } from "@aws-amplify/ui-react";  // Import Amplify UI components
import { Button } from "./ui/button";

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {
  
  if (!formElement || !formElement.designerBtnElement) {
    console.error("SidebarBtnElement received an invalid formElement:", formElement);
    return null;
  }

  const { label, icon: Icon } = formElement.designerBtnElement;

  const draggable = useDraggable({
    id: `designer-btn-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerBtnElement: true,
    },
  });

  return (
    <Button
      ref={draggable.setNodeRef}
      className={`w-[100%] h-20 rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-neutral-800 text-gray-900 dark:text-white 
                flex items-center justify-center gap-2 cursor-grab 
                ${draggable.isDragging ? "ring-2 ring-blue-500" : ""}`}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <Icon className="w-5 h-5" />
      <Text className="text-sm">{label}</Text>
    </Button>
  );
}

export function SidebarBtnElementDragOverlay({ formElement }: { formElement: FormElement }) {
  const { label, icon: Icon } = formElement.designerBtnElement;

  return (
    <Button
    className="px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 
    bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white 
    flex flex-col items-center justify-center gap-1 cursor-grab"
    >
      <Flex  alignItems="center" justifyContent="center">
        <Icon className="h-8 w-8 text-primary" />
        <Text className="text-sm">{label}</Text>
      </Flex>
    </Button>
  );
}

export default SidebarBtnElement;
