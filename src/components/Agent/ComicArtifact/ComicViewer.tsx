"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { ComicScene } from "@/types/diary";

interface ComicViewerProps {
  scene: ComicScene | undefined;
  title: string;
  currentSceneIndex: number;
  totalScenes: number;
  onPrevScene: () => void;
  onNextScene: () => void;
}

export function ComicViewer({
  scene,
  title,
  currentSceneIndex,
  totalScenes,
  onPrevScene,
  onNextScene,
}: ComicViewerProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-2 md:p-4 relative min-h-0 bg-muted/20">
      {scene?.image_url ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={scene.image_url}
            alt={`${title} - 场景 ${currentSceneIndex + 1}`}
            width={800}
            height={600}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-lg"
            priority
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-40 md:h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              {scene?.status === "processing" ? "场景生成中..." : "等待生成..."}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {totalScenes > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            onClick={onPrevScene}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={onNextScene}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </>
      )}
    </div>
  );
}
