"use client";

import { Upload, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";

interface ImageUploadSectionProps {
  uploadedImage: string | null;
  uploadedFile: File | null;
  isDragOver: boolean;
  mounted: boolean;
  onImageUpload: (file: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClearImage: () => void;
}

export default function ImageUploadSection({
  uploadedImage,
  uploadedFile,
  isDragOver,
  mounted,
  onImageUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onClearImage,
}: ImageUploadSectionProps) {
  const t = useTranslations("WorkshopPage");

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div
      className={`bg-card/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6  transition-all duration-700 delay-100 ${
        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      }`}
    >
      <div className="mb-4">
        {!uploadedImage ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-primary bg-secondary"
                : "border-primary/30 hover:border-primary/50 hover:bg-secondary/50"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-primary/50 rounded-xl flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300 hover:border-primary hover:scale-105">
                <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>

              <h3 className="text-base lg:text-lg font-bold text-foreground mb-2">
                {t("dragHere")}
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground mb-3 lg:mb-4 font-medium">
                {t("orClickToSelect")}
              </p>

              <div className="flex items-center gap-2 text-xs lg:text-sm text-primary bg-secondary/50 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border border-border">
                <div className="w-2 h-2 bg-chart-3 rounded-full" />
                <span>{t("supportedFormats")}</span>
              </div>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative group">
            <div className="relative flex justify-center items-center border-2 border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/50">
              <Image
                src={uploadedImage}
                alt="Uploaded image for comic generation"
                className="object-cover"
                width={300}
                height={300}
                style={{ objectFit: "cover" }}
              />

              <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-border">
                <p className="text-xs font-medium text-foreground truncate">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>

            <button
              onClick={onClearImage}
              className="absolute -top-2 -right-2 w-7 h-7 lg:w-8 lg:h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-all duration-300 hover:bg-destructive/80 hover:scale-110 shadow-lg"
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>

            <button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-primary rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 flex items-center gap-1 lg:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-card text-xs lg:text-sm border border-border"
            >
              <Upload className="w-3 h-3" />
              <span>{t("reupload")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
