"use client";

import { useState } from "react";
import { ImageIcon, Download, RefreshCw, Wand2, X } from "lucide-react";
import { ComicScene, ComicFormat, LayoutMode } from "@/types/diary";
import { useTranslations } from "@/hooks/useTranslations";

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
  selectedComicStyle?: string;
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
  onLayoutModeChange,
  selectedComicStyle = "4koma",
}: ComicDisplayProps) {
  const t = useTranslations("WorkshopPage.ComicGeneration.ComicDisplay");
  
  // Modal state for image popup
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle image click
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // 渲染函数 - 使用主题色彩
  const renderErrorState = () => (
    <div className="text-center text-destructive">
      <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-destructive" />
      </div>
      <p className="text-lg mb-2">{t("generationFailed")}</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* 主要进度圆环 */}
      <div className="relative">
        {/* 外层装饰圆环 */}
        <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-pulse"></div>
        
        {/* 进度圆环 */}
        <div className="absolute inset-0 w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            {/* 背景圆环 */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* 进度圆环 */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            />
          </svg>
          
          {/* 中心内容 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Wand2 className="w-8 h-8 text-primary mb-2 animate-pulse" />
            <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 进度信息 */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-foreground">
          {progressMessage || t("generating")}
        </h3>
        
        {/* 场景进度 */}
        {currentScene && totalScenes && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("generatingScene", { current: currentScene, total: totalScenes })}
            </p>
            
            {/* 场景进度条 */}
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalScenes }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    i < currentScene
                      ? "bg-primary"
                      : i === currentScene - 1
                      ? "bg-primary/70 animate-pulse"
                      : "bg-muted/30"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 动态状态文本 */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
          </div>
          <span>AI 正在创作您的漫画</span>
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping [animation-delay:0s]"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-ping [animation-delay:1s]"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-primary/15 rounded-full animate-ping [animation-delay:2s]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-accent/25 rounded-full animate-ping [animation-delay:3s]"></div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* 现代化插图区域 */}
      <div className="relative mb-8">
        {/* 主要图标容器 */}
        <div className="relative w-24 h-24 mx-auto">
          {/* 背景圆环 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-inner"></div>
          
          {/* 图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-primary/70" />
          </div>
          
          {/* 装饰性小图标 */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Wand2 className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* 浮动装饰元素 */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
        <div className="absolute top-8 -right-4 w-1.5 h-1.5 bg-accent/40 rounded-full animate-ping [animation-delay:1s]"></div>
        <div className="absolute -bottom-2 left-8 w-1 h-1 bg-orange-400/50 rounded-full animate-ping [animation-delay:2s]"></div>
      </div>

      {/* 文本内容 */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xl font-bold text-foreground">
          {t("noComicGenerated")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t("writeStoryFirst")}
        </p>
      </div>

      {/* 现代化生成按钮 */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`group relative inline-flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-semibold transition-all duration-300 ${
            canGenerate && !isGenerating
              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {/* 按钮背景光效 */}
          {canGenerate && !isGenerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          )}
          
          {/* 按钮内容 */}
          <div className="relative flex items-center gap-3">
            <Wand2 className={`w-5 h-5 ${isGenerating ? "animate-pulse" : "group-hover:animate-bounce"}`} />
            <span className="text-base">
              {isGenerating ? t("generating") : t("generateComic")}
            </span>
          </div>
        </button>

        {/* 提示文本 */}
        {!canGenerate && !isGenerating && (
          <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            请先在左侧添加角色和编写故事
          </p>
        )}
      </div>
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
    if (format === "single" || selectedComicStyle === "poster") {
      return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* 现代化海报展示 */}
          <div className="relative">
            {/* 海报容器 */}
            <div className="bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 rounded-2xl shadow-2xl border border-border/20 relative overflow-hidden">
              
              {/* 装饰性顶部条 */}
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              
              {/* 纸质纹理效果 */}
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.15)_1px,transparent_0)] [background-size:24px_24px]"></div>

              {/* 海报场景 */}
              <div className="flex justify-center items-center min-h-[400px] relative z-10 p-8">
                <div className="relative group">
                  {/* 海报装饰框 */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-100 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300"></div>
                  
                  <ComicSceneComponent
                    scene={scenes[0]}
                    index={0}
                    panelStyle={getScenePanelStyle()}
                    onRetryScene={onRetryScene}
                    onImageClick={handleImageClick}
                  />
                  
                  {/* 海报标识 */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      POSTER
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 增强的交互按钮组 */}
          <div className="space-y-4">
            {/* 主要操作按钮 */}
            <div className="flex justify-center gap-3">
              {/* 重新生成按钮 */}
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="bg-chart-3/90 hover:bg-chart-3 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">
                  {isGenerating ? t("generating") : t("regenerate")}
                </span>
              </button>

              {/* 下载按钮 */}
              <button className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{t("download")}</span>
              </button>

              {/* 分享按钮 */}
              <button className="bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm font-medium">分享</span>
              </button>
            </div>

            {/* 次要操作按钮 */}
            <div className="flex justify-center gap-2">
              {/* 编辑故事按钮 */}
              <button className="bg-purple-500/90 hover:bg-purple-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑故事
              </button>

              {/* 调整风格按钮 */}
              <button className="bg-orange-500/90 hover:bg-orange-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v7z" />
                </svg>
                调整风格
              </button>

              {/* 保存到收藏 */}
              <button className="bg-pink-500/90 hover:bg-pink-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                收藏
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 动态布局 - 基于选中的漫画风格
    const getGridClass = () => {
      switch (selectedComicStyle) {
        case "poster":
          return "flex justify-center items-center relative z-10";
        case "4koma":
          return "grid grid-cols-2 grid-rows-2 gap-6 relative z-10";
        case "three-panel":
          return "grid grid-cols-1 grid-rows-3 gap-4 relative z-10";
        case "asymmetric":
          return "grid gap-4 relative z-10 asymmetric-layout";
        default:
          // 如果没有选择样式，则使用原来的layoutMode逻辑
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
      }
    };
    const gridClass = getGridClass();

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 现代化漫画画布 */}
        <div className="relative">
          {/* 漫画容器 */}
          <div className="bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 rounded-2xl shadow-2xl border border-border/20 relative overflow-hidden">
            
            {/* 装饰性顶部条 */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            
            {/* 纸质纹理效果 */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>

            {/* 漫画网格 */}
            <div className={`${gridClass} p-8`}>
              {selectedComicStyle === "asymmetric" ? (
                // 不对称布局特殊处理
                <>
                  <style jsx>{`
                    .asymmetric-layout {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      grid-template-rows: 1fr 1fr;
                    }
                    .asymmetric-layout > div:nth-child(1) {
                      grid-row: 1;
                      grid-column: 1;
                    }
                    .asymmetric-layout > div:nth-child(2) {
                      grid-row: 1 / 3;
                      grid-column: 2;
                    }
                    .asymmetric-layout > div:nth-child(3) {
                      grid-row: 2;
                      grid-column: 1;
                    }
                    .asymmetric-layout > div:nth-child(4) {
                      grid-row: 3;
                      grid-column: 1 / 3;
                    }
                  `}</style>
                  {scenes?.slice(0, 4).map((scene, index) => (
                    <div key={scene.id} className="relative group">
                      {/* 场景装饰框 */}
                      <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <ComicSceneComponent
                        scene={scene}
                        index={index}
                        panelStyle={getScenePanelStyle()}
                        onRetryScene={onRetryScene}
                        onImageClick={handleImageClick}
                      />
                      
                      {/* 场景编号 */}
                      <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // 其他布局的正常处理
                scenes?.map((scene, index) => (
                  <div key={scene.id} className="relative group">
                    {/* 场景装饰框 */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <ComicSceneComponent
                      scene={scene}
                      index={index}
                      panelStyle={getScenePanelStyle()}
                      onRetryScene={onRetryScene}
                      onImageClick={handleImageClick}
                    />
                    
                    {/* 场景编号 */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 增强的交互按钮组 */}
        <div className="space-y-4">
          {/* 主要操作按钮 */}
          <div className="flex justify-center gap-3">
            {/* 重新生成按钮 */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="bg-chart-3/90 hover:bg-chart-3 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">
                {isGenerating ? t("generating") : t("regenerate")}
              </span>
            </button>

            {/* 下载按钮 */}
            <button className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">{t("download")}</span>
            </button>

            {/* 分享按钮 */}
            <button className="bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm font-medium">分享</span>
            </button>
          </div>

          {/* 布局控制 */}
          <div className="flex justify-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center mr-2">布局:</span>
            <button 
              onClick={() => onLayoutModeChange("grid-2x2")}
              className={`px-2 py-1 rounded text-xs transition-all ${layoutMode === "grid-2x2" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              2x2
            </button>
            <button 
              onClick={() => onLayoutModeChange("vertical-strip")}
              className={`px-2 py-1 rounded text-xs transition-all ${layoutMode === "vertical-strip" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              垂直
            </button>
            <button 
              onClick={() => onLayoutModeChange("horizontal-strip")}
              className={`px-2 py-1 rounded text-xs transition-all ${layoutMode === "horizontal-strip" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              水平
            </button>
          </div>

          {/* 次要操作按钮 */}
          <div className="flex justify-center gap-2">
            {/* 编辑所有面板 */}
            <button className="bg-purple-500/90 hover:bg-purple-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              批量编辑
            </button>

            {/* 调整间距 */}
            <button className="bg-orange-500/90 hover:bg-orange-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              调整间距
            </button>

            {/* 保存到收藏 */}
            <button className="bg-pink-500/90 hover:bg-pink-500 text-white rounded-md px-3 py-2 flex items-center gap-1.5 transition-all duration-300 text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              收藏
            </button>
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

  // 获取动态标题 - 基于选中的漫画风格
  const getTitle = () => {
    switch (selectedComicStyle) {
      case "poster":
        return "海报样式";
      case "4koma":
        return "四格漫画";
      case "three-panel":
        return "三段分割";
      case "asymmetric":
        return "不对称布局";
      default:
        if (format === "single") return t("poster");
        return t("fourPanelComic");
    }
  };

  return (
    <>
      <div className="relative h-full">
        {/* 现代化玻璃态容器 */}
        <div className="relative h-full bg-gradient-to-br from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden flex flex-col">
          
          {/* 现代化顶部导航栏 */}
          <div className="flex-shrink-0 relative">
            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"></div>
            
            {/* 内容 */}
            <div className="relative px-6 py-4 border-b border-border/10">
              <div className="flex items-center justify-between">
                {/* 左侧标题区域 */}
                <div className="flex items-center gap-4">
                  {/* 现代化图标 */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/90 to-accent/90 p-2.5 shadow-lg">
                      <ImageIcon className="w-full h-full text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Wand2 className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  
                  {/* 标题信息 */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {getTitle()}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-muted-foreground font-medium">
                        AI 智能创作工坊
                      </p>
                    </div>
                  </div>
                </div>

                {/* 右侧状态指示器 */}
                <div className="flex items-center gap-3">
                  {scenes && scenes.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-xs font-medium text-primary">
                        {scenes.length} 个场景
                      </span>
                    </div>
                  )}
                  
                  {isGenerating && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        生成中
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 - 现代化布局 */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderMainContent()}
            </div>
          </div>
        </div>

        {/* 浮动装饰元素 */}
        <div className="absolute -inset-4 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* 图片放大模态框 */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* 模态框内容 */}
          <div className="relative z-10 max-w-7xl max-h-[90vh] mx-4">
            {/* 关闭按钮 */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* 放大的图片 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <img
                src={selectedImage}
                alt="Comic panel enlarged"
                className="max-w-full max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* 下载按钮 */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedImage;
                  link.download = 'comic-panel.png';
                  link.click();
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 text-white text-sm font-medium transition-all duration-200 border border-white/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
