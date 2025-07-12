"use client";

import { useState } from "react";
import ImageUploadSection from "./ImageUploadSection";

interface UploadAnalysisSectionProps {
  uploadedImage: string | null;
  uploadedFile: File | null;
  tags: string[] | null;
  processingStep:
    | "analyzing"
    | "generating-avatar"
    | "generating-three-view"
    | null;
  mounted: boolean;
  onImageUpload: (file: File) => void;
  onClearImage: () => void;
}

export default function UploadAnalysisSection({
  uploadedImage,
  uploadedFile,
  tags,
  processingStep,
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

      {/* 紧凑的分析结果显示 */}
      <div
        className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-amber-100/50 transition-all duration-700 delay-300 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
          <h3 className="text-sm font-bold text-gray-800">分析结果</h3>
        </div>

        {processingStep === "analyzing" ? (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>分析面部特征中...</span>
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag, index) => (
                <span
                  key={index}
                  className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 8 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  +{tags.length - 8} 更多
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            <p className="text-xs">上传图片后将显示分析结果</p>
          </div>
        )}
      </div>
    </div>
  );
}
