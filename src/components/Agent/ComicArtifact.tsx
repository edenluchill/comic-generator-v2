"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { ComicScene } from "@/types/diary";

interface ComicArtifactProps {
  title: string;
  scenes: ComicScene[];
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  isSidePanel?: boolean;
  showOnlyArtifact?: boolean;
}

export default function ComicArtifact({
  title,
  scenes,
  isVisible,
  onClose,
  className = "",
  isSidePanel = false,
  showOnlyArtifact = false,
}: ComicArtifactProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentScene = scenes[currentSceneIndex];
  const totalScenes = scenes.length;

  const handlePrevScene = () => {
    setCurrentSceneIndex((prev) => (prev > 0 ? prev - 1 : totalScenes - 1));
  };

  const handleNextScene = () => {
    setCurrentSceneIndex((prev) => (prev < totalScenes - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    if (currentScene?.image_url) {
      const link = document.createElement("a");
      link.href = currentScene.image_url;
      link.download = `${title}-scene-${currentSceneIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isVisible || scenes.length === 0) return null;

  // 侧边面板模式 - 移除内部动画，由父组件处理
  if (isSidePanel) {
    return (
      <div className={`h-full ${className}`}>
        <Card className="h-full pt-0 pb-6 flex flex-col bg-background border-l">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">{title}</h2>
              <p className="text-sm text-muted-foreground">
                场景 {currentSceneIndex + 1} / {totalScenes}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 只在仅显示漫画模式时显示返回聊天按钮 */}
              {showOnlyArtifact && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                  title="返回聊天"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-8 w-8"
                disabled={!currentScene?.image_url}
              >
                <Download className="w-4 h-4" />
              </Button>

              {!showOnlyArtifact && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main Comic Display */}
            <div className="flex-1 flex items-center justify-center p-4 relative min-h-0">
              {currentScene?.image_url ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentScene.image_url}
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
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">场景生成中...</p>
                </div>
              )}

              {/* Navigation Arrows */}
              {totalScenes > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevScene}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextScene}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Scene Info */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="space-y-2">
                {currentScene?.scenario_description && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium">场景描述：</span>
                    {currentScene.scenario_description}
                  </p>
                )}
                {currentScene?.quote && (
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{currentScene.quote}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Scene Thumbnails */}
            {totalScenes > 1 && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2 overflow-x-auto">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      onClick={() => setCurrentSceneIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                        index === currentSceneIndex
                          ? "border-primary"
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
                          <span className="text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // 原有的全屏模态模式（保持不变）
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`fixed inset-4 md:inset-8 ${className}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="h-full flex flex-col bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex-1">
                <h2 className="font-semibold text-lg truncate">{title}</h2>
                <p className="text-sm text-muted-foreground">
                  场景 {currentSceneIndex + 1} / {totalScenes}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="h-8 w-8"
                  disabled={!currentScene?.image_url}
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Main Comic Display */}
              <div className="flex-1 flex items-center justify-center p-6 relative min-h-0">
                {currentScene?.image_url ? (
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={currentScene.image_url}
                      alt={`${title} - 场景 ${currentSceneIndex + 1}`}
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">场景生成中...</p>
                  </div>
                )}

                {/* Navigation Arrows */}
                {totalScenes > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevScene}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextScene}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Scene Info */}
              <div className="p-4 border-t border-border bg-muted/20">
                <div className="space-y-2">
                  {currentScene?.scenario_description && (
                    <p className="text-sm text-foreground">
                      <span className="font-medium">场景描述：</span>
                      {currentScene.scenario_description}
                    </p>
                  )}
                  {currentScene?.quote && (
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{currentScene.quote}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Scene Thumbnails */}
              {totalScenes > 1 && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2 overflow-x-auto">
                    {scenes.map((scene, index) => (
                      <button
                        key={scene.id}
                        onClick={() => setCurrentSceneIndex(index)}
                        className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                          index === currentSceneIndex
                            ? "border-primary"
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
                            <span className="text-xs text-muted-foreground">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
