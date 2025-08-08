"use client";

import { CharacterStyle } from "@/types/flux";
import SimpleStyleSelector from "./SimpleStyleSelector";
import { Wand2, RefreshCw } from "lucide-react";

interface GenerationSectionProps {
  selectedStyle: CharacterStyle;
  onStyleChange: (style: CharacterStyle) => void;
  onGenerate: () => void;
  onRegenerate?: () => void;
  canGenerate: boolean;
  isProcessing: boolean;
  hasResults: boolean;
  mounted: boolean;
}

export default function GenerationSection({
  selectedStyle,
  onStyleChange,
  onGenerate,
  onRegenerate,
  canGenerate,
  isProcessing,
  hasResults,
  mounted,
}: GenerationSectionProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-1000 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="space-y-6">
        {/* 风格选择器 */}
        <SimpleStyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={onStyleChange}
          disabled={isProcessing}
        />

        {/* 生成按钮区域 */}
        <div className="flex gap-3">
          {!hasResults ? (
            // 初次生成按钮
            <button
              onClick={onGenerate}
              disabled={!canGenerate || isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                canGenerate && !isProcessing
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Wand2
                className={`w-5 h-5 ${isProcessing ? "animate-pulse" : ""}`}
              />
              {isProcessing ? "生成中..." : "开始生成"}
            </button>
          ) : (
            // 重新生成按钮
            <button
              onClick={onRegenerate || onGenerate}
              disabled={isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                !isProcessing
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <RefreshCw
                className={`w-5 h-5 ${isProcessing ? "animate-spin" : ""}`}
              />
              {isProcessing ? "重新生成中..." : "重新生成"}
            </button>
          )}
        </div>

        {/* 提示信息 */}
        <div className="text-center">
          {!hasResults ? (
            <p className="text-sm text-gray-500">
              💡 选择你喜欢的风格，然后点击生成按钮开始创建角色
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              🎨 想要不同风格？选择新的风格然后重新生成
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
