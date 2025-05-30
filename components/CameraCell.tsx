import { useState } from "react";
import { MdCamera } from "react-icons/md";
import { Camera as ReactCameraPro } from "react-camera-pro";
import { Button } from "./ui/button";
import React from "react";

type Props = {
    row: number;
    col: number;
    handleCellChange: (row: number, col: number, value: string) => void;
    readOnly: boolean;
};

function resizeAndCompressImage(base64: string, maxWidth = 500): Promise<string> {
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
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64;
    });
}

type ReactCameraProRef = {
    takePhoto: () => string;
};

export function CameraCell({ row, col, handleCellChange, readOnly }: Props) {
    const [open, setOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = React.useRef<ReactCameraProRef | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

    const takePhoto = async () => {
        const rawImage = cameraRef.current?.takePhoto?.();
        if (!rawImage) return;

        const compressed = await resizeAndCompressImage(rawImage);
        const sizeInBytes = compressed.length * 0.75;

        if (sizeInBytes > 1024 * 1024) {
            alert("Image too large (>1MB). Try again.");
            return;
        }

        setPhoto(compressed);
        handleCellChange(row, col, `[image:${compressed}]`);
        setOpen(false);
    };

    if (readOnly && photo) {
        return (
            <img
                src={photo}
                alt="Captured"
                className="max-w-[100px] max-h-[100px] object-contain border rounded"
            />
        );
    }

    return open ? (
        <div className="flex flex-col items-center">
            <div className="w-[500px] aspect-[16/9] rounded overflow-hidden border">
                <ReactCameraPro
                    key={facingMode}
                    ref={cameraRef}
                    facingMode={facingMode}
                    aspectRatio={16 / 9}
                    errorMessages={{
                        noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                        permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                        switchCamera:
                            'It is not possible to switch camera to different one because there is only one video device accessible.',
                        canvas: 'Canvas is not supported.',
                    }}
                />
            </div>
            <div className="flex gap-2 mt-2">
                <Button onClick={takePhoto}>Take Photo</Button>
                <Button onClick={() => setFacingMode((prev) => prev === "user" ? "environment" : "user")}>
                    Switch
                </Button>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
            </div>
        </div>
    ) : (
        <div className="flex justify-center items-center">
            <button onClick={() => setOpen(true)} className="text-gray-700 hover:text-black">
                <MdCamera size={24} />
            </button>
        </div>
    );
}
