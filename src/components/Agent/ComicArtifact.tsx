"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { ComicScene } from "@/types/diary";
import { useAppSelector } from "@/store/hooks";

interface ComicArtifactProps {
  title: string;
  scenes: ComicScene[];
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  isSidePanel?: boolean;
  showOnlyArtifact?: boolean;
}

// 空状态组件
function EmptyState({
  onTriggerGeneration,
}: {
  onTriggerGeneration: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-purple-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        准备创作你的漫画
      </h3>

      <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
        在聊天框中描述你想要的故事内容，我会帮你创作成精美的漫画
      </p>

      <div className="space-y-3 w-full max-w-sm">
        <Button
          onClick={onTriggerGeneration}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          开始创作漫画
        </Button>

        <div className="text-xs text-muted-foreground">
          💡 试试说：&quot;画一个关于小猫冒险的故事&quot;
        </div>
      </div>
    </div>
  );
}

// 生成进度组件
function GenerationProgress() {
  const { progress, error } = useAppSelector((state) => state.comic);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          {error ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : progress.progress === 100 ? (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          ) : (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          )}
        </div>

        {progress.isGenerating && (
          <div className="absolute -top-2 -right-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 text-xs"
            >
              {progress.progress}%
            </Badge>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {error
          ? "生成遇到问题"
          : progress.progress === 100
          ? "生成完成！"
          : "正在创作中..."}
      </h3>

      <p className="text-muted-foreground mb-4">
        {error ? "请稍后重试" : progress.message}
      </p>

      {/* 进度条 */}
      {progress.isGenerating && (
        <div className="w-full max-w-sm space-y-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            {progress.step && (
              <Badge variant="outline" className="text-xs">
                {getStepLabel(progress.step)}
              </Badge>
            )}

            {progress.currentScene && progress.totalScenes && (
              <span className="text-muted-foreground">
                第 {progress.currentScene} 页 / 共 {progress.totalScenes} 页
              </span>
            )}
          </div>

          {/* 动画点 */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md max-w-sm">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

function getStepLabel(step: string): string {
  const stepLabels: Record<string, string> = {
    checking: "检查余额",
    expanding: "扩展故事",
    creating: "创建漫画",
    generating: "生成场景",
    finalizing: "完成处理",
    completed: "已完成",
    error: "错误",
  };

  return stepLabels[step] || step;
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

  // 从Redux获取状态
  const { progress, error } = useAppSelector((state) => state.comic);

  const currentScene = scenes[currentSceneIndex];
  const totalScenes = scenes.length;

  // 处理触发生成的逻辑
  const handleTriggerGeneration = () => {
    // 这里可以触发一个默认的生成请求，或者滚动到输入框
    const chatInput = document.querySelector(
      'textarea[placeholder*="comic"]'
    ) as HTMLTextAreaElement;
    if (chatInput) {
      chatInput.focus();
      chatInput.placeholder = "描述你想要的漫画故事...";
    }
  };

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

  if (!isVisible) return null;

  // 判断显示什么内容
  const shouldShowEmpty =
    scenes.length === 0 && !progress.isGenerating && !error;
  const shouldShowProgress = progress.isGenerating || error;
  const shouldShowComic = scenes.length > 0 && !progress.isGenerating;

  // 侧边面板模式 - 移动端优化
  if (isSidePanel) {
    return (
      <div className={`h-full ${className}`}>
        <Card className="h-full flex flex-col bg-background border-l md:border-l-0">
          {/* Header */}
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
                  {shouldShowEmpty ? "漫画创作" : title}
                </h2>
                {shouldShowComic && (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    场景 {currentSceneIndex + 1} / {totalScenes}
                  </p>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {shouldShowComic && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="h-8 w-8 md:h-9 md:w-9 hover:bg-accent"
                  disabled={!currentScene?.image_url}
                  title="下载图片"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}

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

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 空状态 */}
            {shouldShowEmpty && (
              <EmptyState onTriggerGeneration={handleTriggerGeneration} />
            )}

            {/* 生成进度 */}
            {shouldShowProgress && <GenerationProgress />}

            {/* 漫画显示 */}
            {shouldShowComic && (
              <>
                {/* Main Comic Display - 优化移动端显示 */}
                <div className="flex-1 flex items-center justify-center p-2 md:p-4 relative min-h-0 bg-muted/20">
                  {currentScene?.image_url ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={currentScene.image_url}
                        alt={`${title} - 场景 ${currentSceneIndex + 1}`}
                        width={600}
                        height={800}
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
                          场景生成中...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Arrows - 移动端优化 */}
                  {totalScenes > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={handlePrevScene}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleNextScene}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border"
                      >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Scene Info - 移动端优化 */}
                <div className="p-3 md:p-4 border-t border-border bg-background/50">
                  <div className="space-y-2">
                    {currentScene?.scenario_description && (
                      <p className="text-xs md:text-sm text-foreground leading-relaxed">
                        <span className="font-medium text-primary">场景：</span>
                        {currentScene.scenario_description}
                      </p>
                    )}
                    {currentScene?.quote && (
                      <p className="text-xs md:text-sm text-muted-foreground italic bg-accent/30 rounded-md p-2 border-l-2 border-primary/30">
                        &quot;{currentScene.quote}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Scene Thumbnails - 移动端优化 */}
                {totalScenes > 1 && (
                  <div className="p-3 md:p-4 border-t border-border bg-background">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {scenes.map((scene, index) => (
                        <button
                          key={scene.id}
                          onClick={() => setCurrentSceneIndex(index)}
                          className={`flex-shrink-0 w-12 h-9 md:w-16 md:h-12 rounded border-2 transition-all ${
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
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // 原有的全屏模态模式（保持不变，但添加空状态和进度显示）
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
                <h2 className="font-semibold text-lg truncate">
                  {shouldShowEmpty ? "漫画创作" : title}
                </h2>
                {shouldShowComic && (
                  <p className="text-sm text-muted-foreground">
                    场景 {currentSceneIndex + 1} / {totalScenes}
                  </p>
                )}
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

                {shouldShowComic && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-8 w-8"
                    disabled={!currentScene?.image_url}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

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
              {/* 空状态 */}
              {shouldShowEmpty && (
                <EmptyState onTriggerGeneration={handleTriggerGeneration} />
              )}

              {/* 生成进度 */}
              {shouldShowProgress && <GenerationProgress />}

              {/* 漫画显示 */}
              {shouldShowComic && (
                <>
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
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
