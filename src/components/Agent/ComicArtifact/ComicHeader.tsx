"use client";

import { Button } from "@/components/ui/button";
import { X, Download, Maximize2, ArrowLeft } from "lucide-react";

interface ComicHeaderProps {
  title: string;
  currentSceneIndex: number;
  totalScenes: number;
  showOnlyArtifact?: boolean;
  onClose: () => void;
  onDownload: () => void;
  onToggleFullscreen?: () => void;
  canDownload: boolean;
}

export function ComicHeader({
  title,
  currentSceneIndex,
  totalScenes,
  showOnlyArtifact = false,
  onClose,
  onDownload,
  onToggleFullscreen,
  canDownload,
}: ComicHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* 移动端返回按钮 */}
        {showOnlyArtifact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 h-auto bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回</span>
          </Button>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base md:text-lg truncate">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            场景 {currentSceneIndex + 1} / {totalScenes}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-accent"
            title="全屏"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onDownload}
          className="h-8 w-8 md:h-9 md:w-9 hover:bg-accent"
          disabled={!canDownload}
          title="下载图片"
        >
          <Download className="w-4 h-4" />
        </Button>

        {!showOnlyArtifact && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-accent"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
