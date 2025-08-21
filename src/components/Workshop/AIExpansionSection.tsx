"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface AIExpansionData {
  expandedStory: string;
  environment: string;
  mood: string;
  additionalDetails?: string;
}

interface AIExpansionSectionProps {
  expandedData: AIExpansionData | null;
  viewMode: "original" | "expanded";
  onSwitchToOriginal: () => void;
  onSwitchToExpanded: () => void;
  comicFormat?: "single" | "four";
  currentStoryText?: string; // 当前文本框中的内容
}

export default function AIExpansionSection({
  expandedData,
  viewMode,
  onSwitchToOriginal,
  onSwitchToExpanded,
  comicFormat = "four",
  currentStoryText,
}: AIExpansionSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyExpanded = async () => {
    const textToCopy = expandedData?.expandedStory;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("复制失败:", error);
      }
    }
  };

  if (!expandedData) return null;

  return (
    <div className="w-full">
      {/* AI 扩展结果卡片 */}
      <div className="bg-gradient-to-br from-white/90 via-white/95 to-white/90 dark:from-gray-900/90 dark:via-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-primary/5 overflow-hidden">
        
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>
        
        {/* 内容 */}
        <div className="relative z-10 p-6 space-y-4">
          {/* 状态指示器 */}
          <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">
              🤖 AI 已为您扩展故事内容
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-lg p-1 backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                <button
                  onClick={onSwitchToOriginal}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "original" 
                      ? "bg-gray-600 text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  📝 原始版本
                </button>
                <button
                  onClick={onSwitchToExpanded}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "expanded" 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  ✨ AI扩展版本
                </button>
              </div>
            </div>
          </div>

          {/* AI扩展详情卡片 - 始终显示 */}
          <div className="space-y-4">
            {/* 当前内容显示 */}
            <div className={`rounded-xl p-4 border transition-all duration-300 ${
              viewMode === "original" 
                ? "bg-gradient-to-br from-gray-50/80 to-gray-100/40 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200/40 dark:border-gray-700/40"
                : "bg-gradient-to-br from-green-50/80 to-green-100/40 dark:from-green-950/30 dark:to-green-900/20 border-green-200/40 dark:border-green-700/40"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg ${
                  viewMode === "original" 
                    ? "text-gray-600 dark:text-gray-400" 
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {viewMode === "original" ? "📝" : "📚"}
                </span>
                <span className={`font-semibold ${
                  viewMode === "original" 
                    ? "text-gray-700 dark:text-gray-300" 
                    : "text-green-700 dark:text-green-300"
                }`}>
                  {viewMode === "original" ? "原始故事内容" : "扩展故事内容"}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 max-h-48 overflow-y-auto">
                {viewMode === "expanded" && comicFormat === "four" && expandedData.expandedStory?.includes("===场景分割===") ? (
                  <div className="space-y-3">
                    {expandedData.expandedStory.split("===场景分割===").map((scene, index) => (
                      <div key={index} className="border-l-4 border-primary/40 pl-3 py-2 bg-white/30 dark:bg-gray-800/30 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            场景 {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {scene.trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {viewMode === "expanded" 
                      ? expandedData.expandedStory 
                      : (currentStoryText || "当前显示原始版本内容（在上方文本框中）")
                    }
                  </p>
                )}
              </div>
            </div>

            {/* AI分析详情 - 始终显示 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 环境描述 */}
              <div className={`rounded-xl p-4 border transition-all duration-300 ${
                viewMode === "original" 
                  ? "bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/15 border-blue-200/30 dark:border-blue-700/30 opacity-75"
                  : "bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/40 dark:border-blue-700/40"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🌍</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">环境描述</span>
                  {viewMode === "original" && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                      AI分析
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
                  {expandedData.environment}
                </p>
              </div>

              {/* 情感氛围 */}
              <div className={`rounded-xl p-4 border transition-all duration-300 ${
                viewMode === "original" 
                  ? "bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/15 border-purple-200/30 dark:border-purple-700/30 opacity-75"
                  : "bg-gradient-to-br from-purple-50/80 to-purple-100/40 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/40 dark:border-purple-700/40"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">💫</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">情感氛围</span>
                  {viewMode === "original" && (
                    <span className="text-xs text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                      AI分析
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-600/90 dark:text-purple-400/90 leading-relaxed">
                  {expandedData.mood}
                </p>
              </div>

              {/* 额外细节 */}
              {expandedData.additionalDetails && (
                <div className={`md:col-span-2 rounded-xl p-4 border transition-all duration-300 ${
                  viewMode === "original" 
                    ? "bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/15 border-amber-200/30 dark:border-amber-700/30 opacity-75"
                    : "bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/40 dark:border-amber-700/40"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-600 dark:text-amber-400 text-lg">✨</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-300">额外细节</span>
                    {viewMode === "original" && (
                      <span className="text-xs text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                        AI分析
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-amber-600/90 dark:text-amber-400/90 leading-relaxed">
                    {expandedData.additionalDetails}
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between pt-3 border-t border-primary/10">
              <div className="text-sm text-muted-foreground">
                当前显示: {viewMode === "original" ? "📝 原始版本" : "✨ AI扩展版本"}
                {viewMode === "original" && (
                  <span className="ml-2 text-xs text-primary">• AI分析仍可查看</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCopyExpanded}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    copied 
                      ? "bg-green-500 text-white"
                      : "bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:shadow-md"
                  }`}
                  type="button"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {viewMode === "original" ? "复制AI分析" : "复制扩展内容"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
