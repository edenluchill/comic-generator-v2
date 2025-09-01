"use client";

import { useState, useRef } from "react";
import { X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 4,
  disabled = false,
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && images.length + 1 <= maxImages
    );

    const updatedImages = [...images, ...newFiles].slice(0, maxImages);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled && images.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center py-2">
          <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {images.length >= maxImages
              ? `Maximum ${maxImages} images`
              : "Drop images here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {images.length}/{maxImages} images
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || images.length >= maxImages}
        />
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="w-3 h-3" />
              </Button>

              <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded text-center truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
