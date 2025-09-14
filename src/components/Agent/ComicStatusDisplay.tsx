"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export function ComicStatusDisplay() {
  const { progress, error } = useAppSelector((state) => state.comic);

  if (!progress.isGenerating && !error) return null;

  return (
    <Card className="mx-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-3">
        {/* 主要状态 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : progress.progress === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}

            <span className="font-medium text-gray-900">
              {error ? "生成失败" : progress.message}
            </span>
          </div>

          {progress.isGenerating && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {progress.progress}%
            </Badge>
          )}
        </div>

        {/* 进度条 */}
        {progress.isGenerating && (
          <div className="space-y-2">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            {/* 详细状态信息 */}
            <div className="flex items-center justify-between text-sm text-blue-700">
              <div className="flex items-center gap-2">
                {progress.step && (
                  <Badge variant="outline" className="text-xs">
                    {getStepLabel(progress.step)}
                  </Badge>
                )}

                {progress.currentScene && progress.totalScenes && (
                  <span>
                    第 {progress.currentScene} 页 / 共 {progress.totalScenes} 页
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 完成状态 */}
        {!progress.isGenerating && progress.progress === 100 && !error && (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">漫画生成完成！</span>
          </div>
        )}
      </div>
    </Card>
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
