"use client";

import Image from "next/image";
import type { ComicScene } from "@/types/diary";
import { SceneStatusIndicator } from "../SceneStatusIndicator";

interface SceneThumbnailsProps {
  scenes: ComicScene[];
  currentSceneIndex: number;
  onSceneSelect: (index: number) => void;
}

export function SceneThumbnails({
  scenes,
  currentSceneIndex,
  onSceneSelect,
}: SceneThumbnailsProps) {
  if (scenes.length <= 1) return null;

  return (
    <div className="p-3 md:p-4 border-t border-border bg-background">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => onSceneSelect(index)}
            className={`relative flex-shrink-0 w-12 h-9 md:w-16 md:h-12 rounded border-2 transition-all ${
              index === currentSceneIndex
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {scene.image_url ? (
              <Image
                src={scene.image_url}
                alt={`场景 ${index + 1}`}
                width={64}
                height={48}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-medium">
                  {index + 1}
                </span>
              </div>
            )}

            {/* 状态指示器 */}
            <SceneStatusIndicator scene={scene} sceneIndex={index} />
          </button>
        ))}
      </div>
    </div>
  );
}
