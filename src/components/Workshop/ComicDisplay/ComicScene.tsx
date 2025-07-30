"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, RefreshCw, Edit, Check, X } from "lucide-react";
import { ComicScene as ComicSceneType } from "@/types/diary";
import { COMIC_DISPLAY_STYLES } from "@/lib/styles/comic-display.styles";

interface ComicSceneProps {
  scene: ComicSceneType;
  index: number;
  panelStyle: string;
  onRetryScene?: (sceneId: string, newDescription: string) => Promise<void>;
}

export default function ComicScene({
  scene,
  index,
  panelStyle,
  onRetryScene,
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

  const renderEditOverlay = () => (
    <div className={COMIC_DISPLAY_STYLES.editOverlay}>
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
            onClick={handleRetryConfirm}
            disabled={isRetrying}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 border-2 border-green-600"
          >
            <Check className="w-3 h-3" />
            重试
          </button>
          <button
            onClick={handleEditCancel}
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 border-2 border-gray-600"
          >
            <X className="w-3 h-3" />
            取消
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={COMIC_DISPLAY_STYLES.sceneContainer}>
      {/* 漫画格子 */}
      <div className={panelStyle}>
        {/* 场景内容 */}
        {scene.image_url ? (
          <Image
            src={scene.image_url}
            alt={`场景 ${index + 1}`}
            className={COMIC_DISPLAY_STYLES.sceneImage}
            width={300}
            height={300}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Tooltip显示描述 */}
        {scene.scenario_description && renderTooltip()}

        {/* 重试按钮 */}
        {onRetryScene && (
          <button
            onClick={handleEditStart}
            disabled={isRetrying}
            className={COMIC_DISPLAY_STYLES.editButton}
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
