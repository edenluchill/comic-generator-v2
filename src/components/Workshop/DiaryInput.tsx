"use client";

import { BookOpen, PenTool } from "lucide-react";

interface DiaryInputProps {
  onTextChange: (text: string) => void;
  value: string;
  disabled?: boolean;
}

export default function DiaryInput({
  onTextChange,
  value,
  disabled,
}: DiaryInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full relative overflow-hidden">
      {/* 纸质背景纹理 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-yellow-100"></div>
      </div>

      {/* 纸张装订线 */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300"></div>
      <div className="absolute left-5 top-0 bottom-0 w-0.5 h-full bg-gradient-to-b from-red-200 to-red-100"></div>

      {/* 纸张孔洞 */}
      <div className="absolute left-3 space-y-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
        ))}
      </div>

      {/* 标题区域 */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-amber-700" />
          <h3 className="text-xl font-bold text-amber-800">故事日记</h3>
          <PenTool className="w-5 h-5 text-amber-600" />
        </div>
        <div className="w-full h-px bg-gradient-to-r from-amber-300 via-orange-300 to-transparent"></div>
      </div>

      {/* 输入区域 */}
      <div className="relative z-10 h-full pb-16">
        <textarea
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          placeholder="在这里写下你的故事...
          
例如：
小明今天在公园里遇到了一只可爱的小猫。小猫很害羞，躲在树后面。小明拿出了一些小鱼干，小心翼翼地走近。最后小猫被美食吸引，和小明成为了好朋友。"
          className="w-full h-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 resize-none font-mono text-sm leading-relaxed pl-8 pr-4 py-2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 1.4rem, #e5e7eb 1.4rem, #e5e7eb calc(1.4rem + 1px))",
            lineHeight: "1.4rem",
          }}
        />
      </div>

      {/* 字数统计 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        {value.length} 字
      </div>

      {/* 装饰元素 */}
      <div className="absolute top-4 right-4 text-amber-200 opacity-20">
        <div className="w-8 h-8 border-2 border-current rounded-full"></div>
      </div>
    </div>
  );
}
