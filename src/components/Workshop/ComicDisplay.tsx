"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Download, RefreshCw, Edit, Check, X } from "lucide-react";
import { ComicScene } from "@/types/diary";

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
}

// 样式常量
const STYLES = {
  container: "bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col",
  header: "flex items-center gap-3 mb-6",
  title: "text-xl font-bold text-gray-800",
  centerContent: "flex-1 flex items-center justify-center",

  // 漫画相关样式
  comicContainer: "w-full max-w-2xl mx-auto",
  comicBook:
    "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 rounded-lg shadow-2xl border border-amber-200 relative overflow-hidden",
  comicGrid: "grid grid-cols-2 gap-6 mb-6 relative z-10",

  // 场景相关样式
  sceneContainer: "relative group",
  scenePanel:
    "aspect-square bg-white border-4 border-amber-200 rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center",
  sceneImage: "max-w-full max-h-full object-contain",
  sceneNumber:
    "absolute top-2 left-2 bg-amber-100 border-2 border-amber-300 rounded-full w-8 h-8 flex items-center justify-center",

  // 按钮样式
  generateButton:
    "w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
  downloadButton:
    "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg border-2 border-blue-700 transform hover:scale-105",

  // 编辑相关样式
  editOverlay:
    "absolute inset-0 bg-white border-4 border-amber-200 rounded-sm p-4 shadow-lg z-20",
  editButton:
    "absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600 disabled:opacity-50 shadow-lg border-2 border-white",
} as const;

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
}: ComicDisplayProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [retryingSceneId, setRetryingSceneId] = useState<string | null>(null);

  // 事件处理函数
  const handleEditScene = (scene: ComicScene) => {
    setEditingSceneId(scene.id);
    setEditedDescription(scene.scenario_description || "");
  };

  const handleCancelEdit = () => {
    setEditingSceneId(null);
    setEditedDescription("");
  };

  const handleConfirmRetry = async (sceneId: string) => {
    if (!onRetryScene) return;

    try {
      setRetryingSceneId(sceneId);
      await onRetryScene(sceneId, editedDescription);
      setEditingSceneId(null);
      setEditedDescription("");
    } catch (error) {
      console.error("重试场景失败:", error);
    } finally {
      setRetryingSceneId(null);
    }
  };

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
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="text-gray-600">{progressMessage || "正在生成漫画..."}</p>
      {currentScene && totalScenes && (
        <p className="text-sm text-gray-500 mt-2">
          正在生成第 {currentScene} 个场景，共 {totalScenes} 个场景
        </p>
      )}
      <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 mx-auto">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{Math.round(progress)}%</p>
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

  const renderSceneTooltip = (scene: ComicScene) => (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 whitespace-nowrap max-w-xs">
      <div className="text-center">
        <p className="font-medium mb-1">{scene.scenario_description}</p>
        {scene.mood && (
          <p className="text-xs text-yellow-300">心情: {scene.mood}</p>
        )}
      </div>
      {/* 小三角箭头 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
    </div>
  );

  const renderEditOverlay = (scene: ComicScene, index: number) => (
    <div className={STYLES.editOverlay}>
      <div className="h-full flex flex-col">
        <div className="text-center mb-3">
          <span className="text-sm font-bold text-gray-800">
            编辑场景 {index + 1}
          </span>
        </div>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="flex-1 p-2 border-2 border-gray-300 rounded text-sm resize-none focus:border-blue-500 focus:outline-none"
          placeholder="编辑场景描述..."
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleConfirmRetry(scene.id)}
            disabled={retryingSceneId === scene.id}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 border-2 border-green-600"
          >
            <Check className="w-3 h-3" />
            重试
          </button>
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 border-2 border-gray-600"
          >
            <X className="w-3 h-3" />
            取消
          </button>
        </div>
      </div>
    </div>
  );

  const renderScene = (scene: ComicScene, index: number) => (
    <div key={scene.id} className={STYLES.sceneContainer}>
      {/* 漫画格子 */}
      <div className={STYLES.scenePanel}>
        {/* 场景内容 */}
        {scene.image_url ? (
          <Image
            src={scene.image_url}
            alt={`场景 ${index + 1}`}
            className={STYLES.sceneImage}
            width={300}
            height={300}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* 场景序号 */}
        {/* <div className={STYLES.sceneNumber}>
          <span className="text-sm font-bold text-brown-700">{index + 1}</span>
        </div> */}

        {/* 改进的Tooltip显示描述 */}
        {scene.scenario_description && renderSceneTooltip(scene)}

        {/* 重试按钮 */}
        {onRetryScene && (
          <button
            onClick={() => handleEditScene(scene)}
            disabled={retryingSceneId === scene.id}
            className={STYLES.editButton}
          >
            {retryingSceneId === scene.id ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 编辑模式 */}
      {editingSceneId === scene.id && renderEditOverlay(scene, index)}
    </div>
  );

  const renderComicGrid = () => (
    <div className={STYLES.comicContainer}>
      <div className={STYLES.comicBook}>
        {/* 纸质纹理效果 */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-amber-100 to-transparent"></div>

        {/* 四格漫画网格 */}
        <div className={STYLES.comicGrid}>
          {scenes?.map((scene, index) => renderScene(scene, index))}
        </div>

        {/* 下载按钮 */}
        <div className="flex justify-center relative z-10">
          <button className={STYLES.downloadButton}>
            <Download className="w-5 h-5" />
            下载漫画
          </button>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (error) return renderErrorState();
    if (isGenerating) return renderLoadingState();
    if (scenes && scenes.length > 0) return renderComicGrid();
    return renderEmptyState();
  };

  const getGenerateButtonStyles = () => {
    const baseStyles = STYLES.generateButton;
    const disabledStyles = "bg-gray-200 text-gray-500 cursor-not-allowed";
    const activeStyles =
      "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";

    return `${baseStyles} ${
      !canGenerate || isGenerating ? disabledStyles : activeStyles
    }`;
  };

  return (
    <div className={STYLES.container}>
      {/* 标题 */}
      <div className={STYLES.header}>
        <ImageIcon className="w-6 h-6 text-purple-600" />
        <h3 className={STYLES.title}>四格漫画</h3>
      </div>

      {/* 主要内容区域 */}
      <div className={STYLES.centerContent}>{renderMainContent()}</div>

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
          {isGenerating ? "生成中..." : "生成四格漫画"}
        </button>
      </div>
    </div>
  );
}
