
import { MdPhotoCamera } from "react-icons/md";


export function DesignerComponent() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 px-3 py-2 rounded border border-gray-400 text-gray-700 cursor-default select-none"
      disabled
    >
      <MdPhotoCamera size={20} />
      <span>Take Photo</span>
    </button>
    //<p>No properties for this element</p>;
  );
}