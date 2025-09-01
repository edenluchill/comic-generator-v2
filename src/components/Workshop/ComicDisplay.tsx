"use client";

import { useState } from "react";
import {
  ImageIcon,
  Download,
  RefreshCw,
  Wand2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
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
  onAddNewPage?: (content: string) => Promise<void>; // 更新回调类型
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
  selectedComicStyle = "4koma",
  onAddNewPage,
}: ComicDisplayProps) {
  const t = useTranslations("WorkshopPage.ComicGeneration.ComicDisplay");

  // 翻页状态
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Modal state for image popup
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 新增页面相关状态
  const [newPageContent, setNewPageContent] = useState("");
  const [isAddingPage, setIsAddingPage] = useState(false);

  // 计算总页数（包括现有场景 + 1个添加新页面的页面）
  const totalPages = (scenes?.length || 0) + 1;

  // 是否在最后一页（添加新页面页面）
  const isOnAddNewPageScreen = currentPageIndex >= (scenes?.length || 0);

  // 当前显示的场景
  const currentScene_display = scenes?.[currentPageIndex];

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

  // 翻页函数
  const goToPrevPage = () => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // 跳转到特定页面
  const goToPage = (pageIndex: number) => {
    setCurrentPageIndex(Math.max(0, Math.min(totalPages - 1, pageIndex)));
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
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 128 128"
          >
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
            <span className="text-2xl font-bold text-primary">
              {Math.round(progress)}%
            </span>
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
              {t("generatingScene", {
                current: currentScene,
                total: totalScenes,
              })}
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

  // 渲染添加新页面的空状态
  const renderAddNewPageState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center min-h-[500px]">
      {/* 现代化插图区域 */}
      <div className="relative mb-8">
        {/* 主要图标容器 */}
        <div className="relative w-32 h-32 mx-auto">
          {/* 背景圆环 */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-inner"></div>

          {/* 图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Plus className="w-12 h-12 text-green-600/70" />
          </div>

          {/* 装饰性小图标 */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* 浮动装饰元素 */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-green-500/30 rounded-full animate-ping"></div>
        <div className="absolute top-8 -right-4 w-1.5 h-1.5 bg-blue-500/40 rounded-full animate-ping [animation-delay:1s]"></div>
        <div className="absolute -bottom-2 left-8 w-1 h-1 bg-purple-400/50 rounded-full animate-ping [animation-delay:2s]"></div>
      </div>

      {/* 文本内容 */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-foreground">添加新页面</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          继续您的故事！描述接下来发生的情节，AI将为您生成新的漫画页面。
        </p>
      </div>

      {/* 输入区域 */}
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <textarea
          value={newPageContent}
          onChange={(e) => setNewPageContent(e.target.value)}
          placeholder="描述接下来的故事情节..."
          className="w-full h-32 p-4 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          disabled={isAddingPage}
        />

        {/* 操作按钮 */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() =>
              setCurrentPageIndex(Math.max(0, (scenes?.length || 0) - 1))
            }
            className="px-6 py-3 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
            disabled={isAddingPage}
          >
            返回上一页
          </button>

          <button
            onClick={async () => {
              if (!newPageContent.trim() || !onAddNewPage) return;

              setIsAddingPage(true);
              try {
                await onAddNewPage(newPageContent);
                setNewPageContent(""); // 清空输入
                // 页面会自动更新，因为scenes会更新
              } catch (error) {
                console.error("添加页面失败:", error);
              } finally {
                setIsAddingPage(false);
              }
            }}
            disabled={!newPageContent.trim() || isAddingPage || !onAddNewPage}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              newPageContent.trim() && !isAddingPage && onAddNewPage
                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isAddingPage ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>生成中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>添加新页面</span>
              </div>
            )}
          </button>
        </div>
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
            <Wand2
              className={`w-5 h-5 ${
                isGenerating ? "animate-pulse" : "group-hover:animate-bounce"
              }`}
            />
            <span className="text-base">
              {isGenerating ? t("generating") : t("generateComic")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // 获取场景面板样式
  const getScenePanelStyle = () => {
    // 翻页模式下，每个场景都占满容器
    return "aspect-[3/4] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-2xl mx-auto";
  };

  // 渲染单个场景（翻页模式）
  const renderSingleScene = () => {
    if (!currentScene_display) return null;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 现代化漫画画布 */}
        <div className="relative">
          {/* 漫画容器 */}
          <div className="bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 rounded-2xl shadow-2xl border border-border/20 relative overflow-hidden">
            {/* 装饰性顶部条 */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

            {/* 纸质纹理效果 */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.15)_1px,transparent_0)] [background-size:24px_24px]"></div>

            {/* 单个场景 */}
            <div className="flex justify-center items-center min-h-[500px] relative z-10 p-8">
              <div className="relative group">
                {/* 场景装饰框 */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-100 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300"></div>

                <ComicSceneComponent
                  scene={currentScene_display}
                  index={currentPageIndex}
                  panelStyle={getScenePanelStyle()}
                  onRetryScene={onRetryScene}
                  onImageClick={handleImageClick}
                />
              </div>
            </div>

            {/* 场景引用文字 - 新增部分 */}
            {currentScene_display.quote && (
              <div className="relative z-10 px-8 pb-6">
                <div className="max-w-2xl mx-auto">
                  <div className="relative bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
                    {/* 装饰引号 */}
                    <div className="absolute -top-3 left-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                        </svg>
                      </div>
                    </div>

                    {/* 引用文字 */}
                    <blockquote className="relative">
                      <p className="text-lg font-medium text-foreground leading-relaxed italic text-center pt-2">
                        &quot;{currentScene_display.quote}&quot;
                      </p>
                    </blockquote>

                    {/* 装饰线条 */}
                    <div className="flex justify-center mt-4">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                {isGenerating ? t("generating") : "重新生成此页"}
              </span>
            </button>

            {/* 下载按钮 */}
            <button className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">{t("download")}</span>
            </button>

            {/* 分享按钮 */}
            <button className="bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              <span className="text-sm font-medium">分享</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染翻页导航
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-6 mt-6">
        {/* 左翻页按钮 */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            currentPageIndex === 0
              ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-foreground shadow-lg hover:shadow-xl hover:scale-110 border border-border/20"
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 页面指示器 */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`transition-all duration-300 ${
                index === currentPageIndex
                  ? "w-8 h-3 bg-primary rounded-full"
                  : "w-3 h-3 bg-muted hover:bg-muted/80 rounded-full"
              }`}
            />
          ))}
        </div>

        {/* 页面计数器 */}
        <div className="text-sm text-muted-foreground font-medium min-w-[60px] text-center">
          {isOnAddNewPageScreen ? (
            <span className="text-green-600">新页面</span>
          ) : (
            <span>
              {currentPageIndex + 1} / {scenes?.length || 0}
            </span>
          )}
        </div>

        {/* 右翻页按钮 */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex >= totalPages - 1}
          className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            currentPageIndex >= totalPages - 1
              ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-foreground shadow-lg hover:shadow-xl hover:scale-110 border border-border/20"
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  };

  // 更新主要内容渲染逻辑
  const renderMainContent = () => {
    if (error) return renderErrorState();
    if (isGenerating || isAddingPage) return renderLoadingState();

    // 如果没有场景，显示空状态
    if (!scenes || scenes.length === 0) {
      return renderEmptyState();
    }

    // 如果在添加新页面页面
    if (isOnAddNewPageScreen) {
      return renderAddNewPageState();
    }

    // 显示当前场景
    return renderSingleScene();
  };

  // 获取动态标题
  const getTitle = () => {
    if (scenes && scenes.length > 0) {
      return `第 ${currentPageIndex + 1} 页`;
    }

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
                        {scenes.length} 个页面
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 - 现代化布局 */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">{renderMainContent()}</div>
          </div>

          {/* 翻页控制器 */}
          {scenes && scenes.length > 0 && (
            <div className="flex-shrink-0 border-t border-border/10 px-6 py-4">
              {renderPaginationControls()}
            </div>
          )}
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
                  const link = document.createElement("a");
                  link.href = selectedImage;
                  link.download = "comic-panel.png";
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
