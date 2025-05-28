import { useRef, useState, useEffect } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { Camera as ReactCameraPro } from "react-camera-pro";

type CameraRef = {
  takePhoto: () => string;
};

type CameraFieldProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
};

export function FormComponent({ value, defaultValue, onChange, readOnly }: CameraFieldProps) {
  const cameraRef = useRef<CameraRef | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(value || defaultValue || null);

  useEffect(() => {
    if (value !== undefined) setPhoto(value);
  }, [value]);

  const openCamera = () => setCameraOpen(true);
  const closeCamera = () => setCameraOpen(false);

  const takePhoto = () => {
    if (!cameraRef.current) return;
    const image = cameraRef.current.takePhoto();
    setPhoto(image);
    closeCamera();
    onChange?.(image);
  };

  if (readOnly) {
    return (
      <div className="flex flex-col items-center gap-2">
        {photo ? (
          <>
            <p className="mb-2">Captured Photo:</p>
            <img src={photo} alt="Captured" className="max-w-xs rounded border" />
          </>
        ) : (
          <p className="text-gray-500 italic">No photo available</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!cameraOpen && (
        <button
          type="button"
          onClick={openCamera}
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <MdPhotoCamera size={20} />
          Open Camera
        </button>
      )}

      {cameraOpen && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-[320px] h-[240px] rounded overflow-hidden border">
            <ReactCameraPro
              ref={cameraRef}
              errorMessages={{
                noCameraAccessible: undefined,
                permissionDenied: undefined,
                switchCamera: undefined,
                canvas: undefined,
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={takePhoto}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Take Photo
            </button>
            <button
              onClick={closeCamera}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {photo && (
        <div className="flex flex-col items-center">
          <p className="mb-2">Photo preview:</p>
          <img src={photo} alt="Captured" className="max-w-xs rounded border" />
        </div>
      )}
    </div>
  );
}
