"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Character } from "@/types/characters";
import CharacterCard from "./CharacterCard";
import CharacterDetailModal from "./CharacterDetailModal";

interface CharactersListProps {
  onAddNewCharacter: () => void;
  mounted: boolean;
  characters: Character[];
  loading?: boolean;
  onDeleteCharacter?: (id: string) => Promise<void>;
}

export default function CharactersList({
  onAddNewCharacter,
  mounted,
  characters,
  loading = false,
  onDeleteCharacter,
}: CharactersListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  return (
    <>
      <div
        className={`transition-all duration-1000 delay-200 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-amber-800 mb-2 flex items-center gap-2">
            我的角色库
            <span className="text-base font-normal bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
              {characters.length}
            </span>
            {loading && (
              <span className="text-sm font-normal text-amber-600 animate-pulse">
                (同步中...)
              </span>
            )}
          </h3>
          <p className="text-sm text-amber-600/80">
            点击角色查看详情，或创建新角色开始你的创作之旅
          </p>
        </div>

        {/* 角色网格 - 移除不必要的底部padding，但保留顶部空间给气泡 */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* 现有角色 */}
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => setSelectedCharacter(character)}
            />
          ))}

          {/* 添加新角色按钮 */}
          <div
            onClick={onAddNewCharacter}
            className="group w-24 h-24 border-2 border-dashed border-amber-300/60 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 relative"
          >
            {/* 上方提示气泡 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
              <div className="relative">
                <div className="bg-white/95 backdrop-blur-md text-amber-800 text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-amber-200/50 whitespace-nowrap">
                  创建新角色
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/95 border-r border-b border-amber-200/50 rotate-45"></div>
              </div>
            </div>

            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

            {/* 图标 */}
            <div className="relative">
              <Plus className="w-8 h-8 text-amber-400 group-hover:text-amber-600 transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>

      {/* 角色详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onDelete={onDeleteCharacter}
        />
      )}
    </>
  );
}
