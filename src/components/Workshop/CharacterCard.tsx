"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Sparkles } from "lucide-react";
import { Character } from "@/types/characters";
import { SimpleSpinner } from "../ui/loading";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export default function CharacterCard({
  character,
  onClick,
}: CharacterCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
      onClick={onClick}
    >
      {/* 角色名称气泡 - 显示在上方 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
        <div className="relative">
          {/* 气泡主体 */}
          <div className="bg-white/95 backdrop-blur-md text-amber-800 text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-amber-200/50 whitespace-nowrap">
            {character.name}
          </div>
          {/* 气泡箭头 - 指向下方 */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/95 border-r border-b border-amber-200/50 rotate-45"></div>
        </div>
      </div>

      {/* 主卡片容器 */}
      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-amber-500/25 border-2 border-amber-200/50 group-hover:border-amber-400/70">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 opacity-80"></div>

        {/* 角色图片 */}
        <div className="relative w-full h-full">
          {imageLoading && <SimpleSpinner />}
          <Image
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
            width={100}
            height={100}
            onLoad={() => setImageLoading(false)}
          />
        </div>

        {/* 悬浮遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        {/* 魔法光效 */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>

        {/* 装饰性光晕 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-2xl opacity-0 group-hover:opacity-30 blur-sm transition-all duration-300 -z-10"></div>
      </div>
    </div>
  );
}
