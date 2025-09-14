"use client";

import type { ComicScene } from "@/types/diary";

interface SceneInfoProps {
  scene: ComicScene | undefined;
}

export function SceneInfo({ scene }: SceneInfoProps) {
  if (!scene) return null;

  return (
    <div className="p-3 md:p-4 border-t border-border bg-background/50">
      <div className="space-y-2">
        {scene.scenario_description && (
          <p className="text-xs md:text-sm text-foreground leading-relaxed">
            <span className="font-medium text-primary">场景：</span>
            {scene.scenario_description}
          </p>
        )}
        {scene.quote && (
          <p className="text-xs md:text-sm text-muted-foreground italic bg-accent/30 rounded-md p-2 border-l-2 border-primary/30">
            &quot;{scene.quote}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
