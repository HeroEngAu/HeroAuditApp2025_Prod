import { useState } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { Camera as ReactCameraPro } from "react-camera-pro";
import { FormElementInstance, SubmitFunction } from "../FormElements";
import React from "react";
import { Button } from "../ui/button";

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
            const compressedBase64 = canvas.toDataURL("image/jpeg", 1);
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
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
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
                    className="flex items-center gap-2 px-3 py-2 rounded border border-gray-400 text-gray-700 cursor-default select-none"
                >
                    <MdPhotoCamera size={20} />
                    Open Camera
                </button>
            )}

            {cameraOpen && (
                <div className="flex flex-col items-center gap-2">
                    <div className="rounded overflow-hidden border">
                        <ReactCameraPro
                            ref={cameraRef}
                            facingMode={facingMode}
                            aspectRatio={16/9}
                            errorMessages={{
                                noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                                permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                                switchCamera:
                                    'It is not possible to switch camera to different one because there is only one video device accessible.',
                                canvas: 'Canvas is not supported.',
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={takePhoto}
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                        >
                            Take Photo
                        </Button>
                        <Button
                            onClick={closeCamera}
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                            }
                            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                        >
                            Switch Camera
                        </Button>

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
