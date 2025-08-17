"use client";

import { ImageIcon, Download, RefreshCw } from "lucide-react";
import { ComicScene, ComicFormat, LayoutMode } from "@/types/diary";
import { ProgressSpinner } from "../ui/loading";

import FormatPicker from "./ComicDisplay/FormatPicker";
import ComicSceneComponent from "./ComicDisplay/ComicScene";

interface ComicDisplayProps {
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  progress?: number;
  progressMessage?: string;
  currentScene?: number;
  totalScenes?: number;
  scenes?: ComicScene[];
  error?: string;
  onRetryScene?: (sceneId: string, newDescription: string) => Promise<void>;
  format: ComicFormat;
  onFormatChange: (format: ComicFormat) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
}

export default function ComicDisplay({
  isGenerating,
  progress = 0,
  progressMessage = "",
  currentScene,
  totalScenes = 4,
  scenes,
  error,
  onRetryScene,
  format,
  onFormatChange,
  layoutMode,
}: ComicDisplayProps) {
  // 渲染函数 - 使用主题色彩
  const renderErrorState = () => (
    <div className="text-center text-destructive">
      <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-lg mb-2">生成失败</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center">
      <ProgressSpinner
        progress={progress}
        message={progressMessage || "正在生成漫画..."}
        color="primary"
        size="lg"
        showProgressBar={true}
        showPercentage={true}
      />
      {currentScene && totalScenes && (
        <p className="text-sm text-muted-foreground mt-2">
          正在生成第 {currentScene} 个场景，共 {totalScenes} 个场景
        </p>
      )}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center text-muted-foreground">
      <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground" />
      </div>
      <p className="text-lg mb-2 text-foreground/80">还没有生成漫画</p>
      <p className="text-sm">写好故事后点击生成按钮</p>
    </div>
  );

  // 获取场景面板样式
  const getScenePanelStyle = () => {
    if (format === "single")
      return "aspect-[3/4] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-md mx-auto";
    if (layoutMode === "horizontal-strip")
      return "aspect-[1/1.2] bg-card border-4 border-border rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center";
    if (layoutMode === "comic-book")
      return "aspect-[3/4] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center";
    return "aspect-square bg-card border-4 border-border rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center";
  };

  // 根据格式和布局渲染漫画
  const renderComicGrid = () => {
    if (!scenes || scenes.length === 0) return null;

    // 单格漫画 (海报模式) - 使用主题色彩
    if (format === "single") {
      return (
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-2xl border border-border relative overflow-hidden">
            {/* 纸质纹理效果 - 使用主题色彩 */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-secondary to-transparent"></div>

            {/* 浮动下载按钮 - 使用主题色彩 */}
            <button className="absolute top-4 right-4 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">下载</span>
            </button>

            {/* 海报内容 */}
            <div className="flex justify-center items-center min-h-[400px] relative z-10 p-6">
              <ComicSceneComponent
                scene={scenes[0]}
                index={0}
                panelStyle={getScenePanelStyle()}
                onRetryScene={onRetryScene}
              />
            </div>
          </div>
        </div>
      );
    }

    // 四格漫画 - 使用主题色彩
    const getGridClass = () => {
      switch (layoutMode) {
        case "grid-2x2":
          return "grid grid-cols-2 gap-6 relative z-10";
        case "vertical-strip":
          return "grid grid-cols-1 gap-4 relative z-10";
        case "horizontal-strip":
          return "grid grid-cols-4 gap-3 relative z-10";
        case "comic-book":
          return "grid grid-cols-2 gap-8 relative z-10";
        default:
          return "grid grid-cols-2 gap-6 relative z-10";
      }
    };
    const gridClass = getGridClass();

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl shadow-2xl border border-border relative overflow-hidden">
          {/* 纸质纹理效果 - 使用主题色彩 */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-secondary to-transparent"></div>

          {/* 浮动下载按钮 - 使用主题色彩 */}
          <button className="absolute top-4 right-4 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm z-20">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">下载</span>
          </button>

          {/* 漫画网格 */}
          <div className={`${gridClass} p-6`}>
            {scenes?.map((scene, index) => (
              <ComicSceneComponent
                key={scene.id}
                scene={scene}
                index={index}
                panelStyle={getScenePanelStyle()}
                onRetryScene={onRetryScene}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (error) return renderErrorState();
    if (isGenerating) return renderLoadingState();
    if (scenes && scenes.length > 0) return renderComicGrid();
    return renderEmptyState();
  };

  // 获取动态标题
  const getTitle = () => {
    if (format === "single") return "海报";
    return "四格漫画";
  };

  return (
    <>
      <div className="bg-card rounded-2xl shadow-lg border border-border h-full flex flex-col relative overflow-hidden">
        {/* 头部控制区域 - 使用主题色彩 */}
        <div className="flex-shrink-0 bg-gradient-to-r from-secondary/50 to-accent/30 border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {getTitle()}
            </h3>
            <FormatPicker
              currentFormat={format}
              onFormatChange={onFormatChange}
            />
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">{renderMainContent()}</div>
      </div>
    </>
  );
}
