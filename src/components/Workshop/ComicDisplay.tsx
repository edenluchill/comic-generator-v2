"use client";

import { ImageIcon, Download, RefreshCw } from "lucide-react";

interface ComicDisplayProps {
  comicUrl?: string;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export default function ComicDisplay({
  comicUrl,
  isGenerating,
  onGenerate,
  canGenerate,
}: ComicDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-800">四格漫画</h3>
      </div>

      {/* 漫画显示区域 */}
      <div className="flex-1 flex items-center justify-center">
        {isGenerating ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">正在生成漫画...</p>
            <p className="text-sm text-gray-500 mt-2">这可能需要几分钟时间</p>
          </div>
        ) : comicUrl ? (
          <div className="w-full">
            <img
              src={comicUrl}
              alt="生成的四格漫画"
              className="w-full max-w-lg mx-auto rounded-lg shadow-md"
            />
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                下载漫画
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg mb-2">还没有生成漫画</p>
            <p className="text-sm">写好故事后点击生成按钮</p>
          </div>
        )}
      </div>

      {/* 生成按钮 */}
      <div className="mt-6">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            !canGenerate || isGenerating
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
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
