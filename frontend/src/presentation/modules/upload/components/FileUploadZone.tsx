"use client";

import React, { useRef, ChangeEvent, DragEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ====================== Tipagem ======================
type UploadedFile = {
  url?: string;
  name?: string;
};

type FileUploadZoneProps = {
  onFileUpload: (file: File) => void;
  uploadedFile?: UploadedFile | null;
  uploading?: boolean;
  onRemoveFile: () => void;
};

// ====================== Helpers ======================
const isVideoFile = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|mov|avi|mkv|webm)$/i.test(url);
};

const isImageFile = (url?: string) => {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png)$/i.test(url);
};

// ====================== Componente ======================
export function FileUploadZone({
  onFileUpload,
  uploadedFile,
  uploading = false,
  onRemoveFile,
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // === Eventos ===
  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setCropOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      onFileUpload(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setCropOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  // === Preview do Arquivo ===
  if (uploadedFile) {
    return (
      <div className="relative">
        <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
              {isVideoFile(uploadedFile.url) ? (
                <Video className="w-8 h-8 text-slate-400" />
              ) : isImageFile(uploadedFile.url) ? (
                <img
                  src={uploadedFile.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {uploadedFile.name || "Arquivo"}
              </p>
              <p className="text-sm text-slate-500">
                Arquivo carregado com sucesso
              </p>
            </div>

            {/* Remover */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemoveFile}
              className="flex-shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === Área de Upload ===
  return (
    <>
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        "border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer",
        "hover:border-[#053665] hover:bg-slate-50 transition-all duration-200"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#053665] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Enviando arquivo...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-900 font-medium mb-1">
              Clique para selecionar ou arraste um arquivo
            </p>
            <p className="text-sm text-slate-500">
              Imagens ou vídeos (PNG, JPG, MP4, MOV)
            </p>
          </div>
        </div>
      )}
    </div>

    <Dialog open={cropOpen} onOpenChange={setCropOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-80 bg-black/50 rounded-md overflow-hidden">
          {cropSrc && (
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
          )}
        </div>
        <DialogFooter>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setCropOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={async () => {
              if (!cropSrc || !croppedAreaPixels) return;
              const file = await getCroppedFile(cropSrc, croppedAreaPixels);
              setCropOpen(false);
              onFileUpload(file);
            }}>Aplicar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

async function getCroppedFile(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");

  const size = Math.max(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Falha ao gerar imagem");
      const file = new File([blob], "cropped.png", { type: "image/png" });
      resolve(file);
    }, "image/png");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}
