"use client";

import { useState } from "react";
import ImageUploadSection from "./ImageUploadSection";

interface UploadAnalysisSectionProps {
  uploadedImage: string | null;
  uploadedFile: File | null;
  mounted: boolean;
  onImageUpload: (file: File) => void;
  onClearImage: () => void;
}

export default function UploadAnalysisSection({
  uploadedImage,
  uploadedFile,
  mounted,
  onImageUpload,
  onClearImage,
}: UploadAnalysisSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <ImageUploadSection
        uploadedImage={uploadedImage}
        uploadedFile={uploadedFile}
        isDragOver={isDragOver}
        mounted={mounted}
        onImageUpload={onImageUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClearImage={onClearImage}
      />
    </div>
  );
}
