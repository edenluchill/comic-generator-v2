"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Character } from "@/types/characters";
import CharacterCard from "./CharacterCard";
import CharacterDetailModal from "./CharacterDetailModal";
import { SimpleSpinner } from "../ui/loading";

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
          <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            我的角色库
            <span className="text-base font-normal bg-secondary text-primary px-3 py-1 rounded-full border border-border">
              {characters.length}
            </span>
            {loading && <SimpleSpinner />}
          </h3>
        </div>

        {/* 角色网格 */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* 现有角色 */}
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => setSelectedCharacter(character)}
            />
          ))}

          {/* 添加新角色按钮 - 使用主题色彩 */}
          <div
            onClick={onAddNewCharacter}
            className="group w-24 h-24 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-gradient-to-br hover:from-secondary hover:to-accent/30 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 relative"
          >
            {/* 上方提示气泡 - 使用主题色彩 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
              <div className="relative">
                <div className="bg-card/95 backdrop-blur-md text-foreground text-xs font-medium px-3 py-2 rounded-xl shadow-lg border border-border whitespace-nowrap">
                  创建新角色
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-card/95 border-r border-b border-border rotate-45"></div>
              </div>
            </div>

            {/* 背景渐变 - 使用主题色彩 */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-accent/30 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

            {/* 图标 */}
            <div className="relative">
              <Plus className="w-8 h-8 text-primary/60 group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
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
