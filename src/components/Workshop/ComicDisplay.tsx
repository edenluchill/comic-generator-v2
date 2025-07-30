"use client";

import { ImageIcon, Download, RefreshCw } from "lucide-react";
import { ComicScene, ComicFormat, LayoutMode } from "@/types/diary";
import { ProgressSpinner } from "../ui/loading";
import { COMIC_DISPLAY_STYLES } from "@/lib/styles/comic-display.styles";
import FormatPicker from "./ComicDisplay/FormatPicker";
import ComicSceneComponent from "./ComicDisplay/ComicScene";
// import LayoutPicker from "./ComicDisplay/LayoutPicker";

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
  onGenerate,
  canGenerate,
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
  // 渲染函数
  const renderErrorState = () => (
    <div className="text-center text-red-600">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-500" />
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
        <p className="text-sm text-gray-500 mt-2">
          正在生成第 {currentScene} 个场景，共 {totalScenes} 个场景
        </p>
      )}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center text-gray-500">
      <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-lg mb-2">还没有生成漫画</p>
      <p className="text-sm">写好故事后点击生成按钮</p>
    </div>
  );

  // 获取场景面板样式
  const getScenePanelStyle = () => {
    if (format === "single") return COMIC_DISPLAY_STYLES.scenePanels.single;
    if (layoutMode === "horizontal-strip")
      return COMIC_DISPLAY_STYLES.scenePanels.horizontal;
    if (layoutMode === "comic-book")
      return COMIC_DISPLAY_STYLES.scenePanels["comic-book"];
    return COMIC_DISPLAY_STYLES.scenePanels.default;
  };

  // 根据格式和布局渲染漫画
  const renderComicGrid = () => {
    if (!scenes || scenes.length === 0) return null;

    // 单格漫画 (海报模式) - 优化尺寸和下载按钮
    if (format === "single") {
      return (
        <div className={COMIC_DISPLAY_STYLES.posterContainer}>
          <div className={COMIC_DISPLAY_STYLES.comicBook}>
            {/* 纸质纹理效果 */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-amber-100 to-transparent"></div>

            {/* 浮动下载按钮 */}
            <button className={COMIC_DISPLAY_STYLES.downloadButton}>
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">下载</span>
            </button>

            {/* 海报内容 */}
            <div className="flex justify-center items-center min-h-[400px] relative z-10">
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

    // 四格漫画
    const gridClass =
      COMIC_DISPLAY_STYLES.comicGrids[layoutMode] ||
      COMIC_DISPLAY_STYLES.comicGrids["grid-2x2"];

    return (
      <div className={COMIC_DISPLAY_STYLES.comicContainer}>
        <div className={COMIC_DISPLAY_STYLES.comicBook}>
          {/* 纸质纹理效果 */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-amber-100 to-transparent"></div>

          {/* 浮动下载按钮 */}
          <button className={COMIC_DISPLAY_STYLES.downloadButton}>
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">下载</span>
          </button>

          {/* 漫画网格 */}
          <div className={gridClass}>
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

  // ... existing code ...

  const renderMainContent = () => {
    if (error) return renderErrorState();
    if (isGenerating) return renderLoadingState();
    if (scenes && scenes.length > 0) return renderComicGrid();
    return renderEmptyState();
  };

  const getGenerateButtonStyles = () => {
    const baseStyles = COMIC_DISPLAY_STYLES.generateButton;
    const disabledStyles = "bg-gray-200 text-gray-500 cursor-not-allowed";
    const activeStyles =
      "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";

    return `${baseStyles} ${
      !canGenerate || isGenerating ? disabledStyles : activeStyles
    }`;
  };

  // 获取动态标题
  const getTitle = () => {
    if (format === "single") return "海报";
    return "四格漫画";
  };

  // 获取动态按钮文本
  const getButtonText = () => {
    if (isGenerating) return "生成中...";
    if (format === "single") return "生成海报";
    return "生成四格漫画";
  };

  // 点击外部关闭dropdown
  const handleClickOutside = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The dropdowns are now self-contained, so no need to close here
  };

  return (
    <>
      {/* 点击外部关闭dropdown的遮罩 */}
      {
        /* showFormatDropdown || showLayoutDropdown */ false && (
          <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
        )
      }

      <div className={COMIC_DISPLAY_STYLES.container}>
        {/* 标题和控制器 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            <h3 className={COMIC_DISPLAY_STYLES.title}>{getTitle()}</h3>
          </div>
          <div className="flex items-center gap-3">
            <FormatPicker
              format={format}
              onFormatChange={onFormatChange}
              disabled={isGenerating}
            />
            {/* {format === "four" && (
              <LayoutPicker
                layoutMode={layoutMode}
                onLayoutModeChange={onLayoutModeChange}
                disabled={isGenerating}
              />
            )} */}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className={COMIC_DISPLAY_STYLES.centerContent}>
          {renderMainContent()}
        </div>

        {/* 生成按钮 */}
        <div className="mt-6">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className={getGenerateButtonStyles()}
          >
            <RefreshCw
              className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {getButtonText()}
          </button>
        </div>
      </div>
    </>
  );
}
