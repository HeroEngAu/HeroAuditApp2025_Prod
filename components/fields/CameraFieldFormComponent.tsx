import { useRef, useState } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { Camera as ReactCameraPro } from "react-camera-pro";
import { FormElementInstance, SubmitFunction } from "../FormElements";
import React from "react";

type Props = {
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    defaultValue?: string;
    readOnly?: boolean;
    isInvalid?: boolean;
    pdf?: boolean;
};

type CameraFieldExtraAttributes = {
    content?: string;
};

type CameraFieldInstance = FormElementInstance & {
    extraAttributes?: CameraFieldExtraAttributes;
};

type ReactCameraProRef = {
  takePhoto: () => string;
};

function resizeAndCompressImage(base64: string, maxWidth = 600): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = maxWidth / img.width;
            const canvas = document.createElement("canvas");
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas context error");

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
            resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64;
    });
}

export function FormComponent({
    elementInstance,
    submitValue,
    defaultValue,
    readOnly = false,
}: Props) {
    const cameraElement = elementInstance as CameraFieldInstance;
    const cameraRef = React.useRef<ReactCameraProRef | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(
        defaultValue || cameraElement.extraAttributes?.content || null
    );
    const openCamera = () => setCameraOpen(true);
    const closeCamera = () => setCameraOpen(false);

    const takePhoto = async () => {
        if (!cameraRef.current) return;

        const rawImage = cameraRef.current?.takePhoto();
        try {
            const compressed = await resizeAndCompressImage(rawImage);
            setPhoto(compressed);

            cameraElement.extraAttributes = {
                ...cameraElement.extraAttributes,
                content: compressed,
            };

            submitValue?.(compressed, cameraElement.id);
            closeCamera();
        } catch (err) {
            console.error("Image processing failed", err);
        }
    };

    if (readOnly && photo) {
        return (
            <div className="flex flex-col items-center">
                <p className="mb-2">Captured photo:</p>
                <img src={photo} alt="Captured" className="max-w-xs rounded border" />
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

            {photo && !readOnly && (
                <div className="flex flex-col items-center">
                    <p className="mb-2">Photo preview:</p>
                    <img src={photo} alt="Captured" className="max-w-xs rounded border" />
                </div>
            )}
        </div>
    );
}
