"use client";

import { Upload, ImageIcon } from "lucide-react";
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
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 lg:p-6 border border-amber-100/50 transition-all duration-700 delay-100 ${
        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
        <div className="w-6 h-6 lg:w-8 lg:h-8 border-2 border-amber-400/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:border-amber-500 hover:scale-105">
          <Upload className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-amber-800">
          {t("uploadImage")}
        </h2>
      </div>

      <div className="mb-4">
        {!uploadedImage ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-amber-500 bg-amber-50"
                : "border-amber-300 hover:border-amber-400 hover:bg-amber-50/50"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-amber-400/50 rounded-xl flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300 hover:border-amber-500 hover:scale-105">
                <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
              </div>

              <h3 className="text-base lg:text-lg font-bold text-amber-800 mb-2">
                {t("dragHere")}
              </h3>
              <p className="text-sm lg:text-base text-amber-700 mb-3 lg:mb-4 font-medium">
                {t("orClickToSelect")}
              </p>

              <div className="flex items-center gap-2 text-xs lg:text-sm text-amber-600 bg-white/50 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border border-amber-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
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
            <div className="relative border-2 border-amber-200 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <Image
                src={uploadedImage}
                alt="Uploaded image for comic generation"
                className="w-full h-40 lg:h-48 object-cover"
                width={400}
                height={192}
                style={{ objectFit: "cover" }}
              />

              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs font-medium text-amber-800 truncate">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-amber-600">
                  {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>

            <button
              onClick={onClearImage}
              className="absolute -top-2 -right-2 w-7 h-7 lg:w-8 lg:h-8 bg-red-500 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:scale-110"
            >
              <svg
                className="w-3 h-3 lg:w-4 lg:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-amber-700 rounded-lg px-2 lg:px-3 py-1 lg:py-1.5 flex items-center gap-1 lg:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white text-xs lg:text-sm"
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
