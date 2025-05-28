import { MdPhotoCamera } from "react-icons/md";
import { FormElementInstance } from "../FormElements";
import { CustomInstance } from "./CameraField"

type Props = {
  elementInstance: FormElementInstance;
};

export function DesignerComponent({ elementInstance }: Props) {
  const label =
    typeof elementInstance.extraAttributes === "object" &&
    elementInstance.extraAttributes !== null &&
    "label" in elementInstance.extraAttributes
      ? (elementInstance.extraAttributes as CustomInstance).label
      : "";

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded border border-gray-400 text-gray-700 cursor-default select-none"
        disabled
      >
        <MdPhotoCamera size={20} />
        <span>Take Photo</span>
      </button>
    </div>
  );
}
