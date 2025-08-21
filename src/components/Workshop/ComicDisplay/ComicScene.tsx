"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCw, Edit, Check, X, Copy, Heart, MoreHorizontal } from "lucide-react";
import { ComicScene as ComicSceneType } from "@/types/diary";

interface ComicSceneProps {
  scene: ComicSceneType;
  index: number;
  panelStyle: string;
  onRetryScene?: (sceneId: string, newDescription: string) => Promise<void>;
  onImageClick?: (imageUrl: string) => void;
}

export default function ComicScene({
  scene,
  index,
  panelStyle,
  onRetryScene,
  onImageClick,
}: ComicSceneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditedDescription(scene.scenario_description || "");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedDescription("");
  };

  const handleRetryConfirm = async () => {
    if (!onRetryScene) return;

    try {
      setIsRetrying(true);
      await onRetryScene(scene.id, editedDescription);
      setIsEditing(false);
      setEditedDescription("");
    } catch (error) {
      console.error("重试场景失败:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const renderTooltip = () => (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-foreground/90 text-background px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 whitespace-nowrap max-w-xs backdrop-blur-sm">
      <div className="text-center">
        <p className="font-medium mb-1">{scene.scenario_description}</p>
        {scene.mood && (
          <p className="text-xs text-accent">心情: {scene.mood}</p>
        )}
      </div>
      {/* 小三角箭头 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground/90"></div>
    </div>
  );

  const renderEditOverlay = () => (
    <div className="absolute inset-0 bg-card/95 backdrop-blur-sm border-2 border-primary rounded-lg p-3 z-20">
      <div className="h-full flex flex-col">
        <div className="text-center mb-3">
          <span className="text-sm font-bold text-foreground">
            编辑场景 {index + 1}
          </span>
        </div>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="flex-1 p-2 bg-background border-2 border-border rounded text-sm resize-none focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground"
          placeholder="编辑场景描述..."
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleRetryConfirm}
            disabled={isRetrying}
            className="flex items-center gap-1 px-3 py-1 bg-chart-3 text-white rounded text-sm hover:bg-chart-3/80 disabled:opacity-50 border-2 border-chart-3"
          >
            <Check className="w-3 h-3" />
            重试
          </button>
          <button
            onClick={handleEditCancel}
            className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded text-sm hover:bg-muted/80 border-2 border-border"
          >
            <X className="w-3 h-3" />
            取消
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative group">
      {/* 漫画格子 - 使用主题边框 */}
      <div
        className={`${panelStyle} border-2 border-border group-hover:border-primary/30 transition-colors duration-200`}
      >
        {/* 场景内容 */}
        {scene.image_url ? (
          <Image
            src={scene.image_url}
            alt={`场景 ${index + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
            width={300}
            height={300}
            onClick={() => onImageClick?.(scene.image_url)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Tooltip显示描述 */}
        {scene.scenario_description && renderTooltip()}

        {/* 重试按钮 - 使用主题色彩 */}
        {onRetryScene && (
          <button
            onClick={handleEditStart}
            disabled={isRetrying}
            className="absolute top-2 right-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 编辑模式 */}
      {isEditing && renderEditOverlay()}
    </div>
  );
}
