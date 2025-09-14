"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ComicScene } from "@/types/diary";

interface SceneStatusIndicatorProps {
  scene: ComicScene;
  sceneIndex: number;
}

export function SceneStatusIndicator({
  scene,
  sceneIndex,
}: SceneStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (scene.status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "processing":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (scene.status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = () => {
    switch (scene.status) {
      case "completed":
        return "已完成";
      case "processing":
        return "生成中";
      case "failed":
        return "失败";
      default:
        return "等待中";
    }
  };

  return (
    <div className="absolute top-1 right-1">
      <Badge
        variant="outline"
        className={`text-xs px-1 py-0.5 h-auto ${getStatusColor()}`}
      >
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </Badge>
    </div>
  );
}
