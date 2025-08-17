"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Download, RefreshCw, Edit, Check, X } from "lucide-react";
import { ComicScene } from "@/types/diary";

interface PosterDisplayProps {
  scene?: ComicScene;
  isGenerating?: boolean;
  onRetryScene?: (sceneId: string, newDescription: string) => Promise<void>;
  onDownload?: () => void;
  title?: string;
}

export default function PosterDisplay({
  scene,
  isGenerating = false,
  onRetryScene,
  onDownload,
  title = "海报预览",
}: PosterDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleEditStart = () => {
    if (scene) {
      setIsEditing(true);
      setEditedDescription(scene.scenario_description || "");
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedDescription("");
  };

  const handleRetryConfirm = async () => {
    if (!onRetryScene || !scene) return;

    try {
      setIsRetrying(true);
      await onRetryScene(scene.id, editedDescription);
      setIsEditing(false);
      setEditedDescription("");
    } catch (error) {
      console.error("重试海报失败:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDownload = async () => {
    if (!scene?.image_url || !onDownload) return;
    onDownload();
  };

  const renderEditOverlay = () => (
    <div className="absolute inset-4 bg-white border-4 border-amber-200 rounded-lg p-6 shadow-lg z-20">
      <div className="h-full flex flex-col">
        <div className="text-center mb-4">
          <span className="text-lg font-bold text-gray-800">编辑海报描述</span>
        </div>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="flex-1 p-4 border-2 border-gray-300 rounded-lg text-base resize-none focus:border-blue-500 focus:outline-none min-h-32"
          placeholder="编辑海报场景描述..."
        />
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={handleRetryConfirm}
            disabled={isRetrying}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg text-base hover:bg-green-600 disabled:opacity-50 border-2 border-green-600 transition-all duration-200"
          >
            <Check className="w-5 h-5" />
            {isRetrying ? "重新生成中..." : "重新生成"}
          </button>
          <button
            onClick={handleEditCancel}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg text-base hover:bg-gray-600 border-2 border-gray-600 transition-all duration-200"
          >
            <X className="w-5 h-5" />
            取消
          </button>
        </div>
      </div>
    </div>
  );

  const renderTooltip = () => {
    if (!scene?.scenario_description) return null;

    return (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 whitespace-nowrap max-w-md">
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-secondary via-accent/30 to-primary/20 p-8 rounded-lg shadow-2xl border border-border relative overflow-hidden group">
        {/* 纸质纹理效果 */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-amber-100 to-transparent"></div>

        {/* 标题 */}
        {title && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 z-30">
            {title}
          </div>
        )}

        {/* 下载按钮 */}
        {scene?.image_url && onDownload && (
          <button
            onClick={handleDownload}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm text-foreground rounded-full hover:bg-card hover:shadow-lg transition-all duration-300 border border-border opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">下载</span>
          </button>
        )}

        {/* 编辑按钮 */}
        {onRetryScene && scene && (
          <button
            onClick={handleEditStart}
            disabled={isRetrying}
            className="absolute top-4 right-16 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600 disabled:opacity-50 shadow-lg border-2 border-white z-30"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
        )}

        {/* 4:3海报内容 */}
        <div className="flex justify-center items-center min-h-[500px] relative z-10">
          <div className="relative group">
            <div className="aspect-[4/3] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-4xl mx-auto">
              {/* 生成中状态 */}
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">正在生成海报...</p>
                </div>
              ) : scene?.image_url ? (
                /* 海报图片 */
                <Image
                  src={scene.image_url}
                  alt="4:3海报"
                  className="w-full h-full object-contain max-w-[1024px] max-h-[768px]"
                  width={1024}
                  height={768}
                  priority
                />
              ) : (
                /* 空状态 */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">等待生成海报</p>
                </div>
              )}

              {/* Tooltip显示描述 */}
              {renderTooltip()}
            </div>

            {/* 编辑模式 */}
            {isEditing && renderEditOverlay()}
          </div>
        </div>
      </div>
    </div>
  );
}
