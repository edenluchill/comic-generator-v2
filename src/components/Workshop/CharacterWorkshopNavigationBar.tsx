import { ArrowLeft, Users } from "lucide-react";
import { Character } from "@/types/characters";
import Image from "next/image";

export interface CharacterWorkshopNavigationBarProps {
  onBack: () => void;
  characters: Character[];
  onOpenCharacterDrawer: () => void;
  loading: boolean;
  mounted: boolean;
}

export function CharacterWorkshopNavigationBar({
  onBack,
  characters,
  onOpenCharacterDrawer,
  loading,
  mounted,
}: CharacterWorkshopNavigationBarProps) {
  return (
    <div
      className={`
        flex items-center justify-between mb-6 p-1 bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border
        transition-all duration-1000 
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      {/* 左侧：返回按钮 - 使用主题色彩 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-primary hover:text-primary/80 hover:bg-secondary/50 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">返回控制台</span>
      </button>

      {/* 右侧：角色库信息 */}
      <div className="flex items-center gap-0">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
            <div className="text-sm font-medium text-muted-foreground">
              加载中...
            </div>
          </div>
        ) : (
          <>
            {/* 角色预览 - 使用主题色彩 */}
            {characters.length > 0 && (
              <div className="flex -space-x-1">
                {characters.slice(0, 3).map((character) => (
                  <div
                    key={character.id}
                    className="w-8 h-8 rounded-full border-2 border-card overflow-hidden shadow-sm hover:scale-110 transition-transform duration-200"
                  >
                    <Image
                      src={character.avatar_url}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 角色库按钮 - 使用主题色彩 */}
            <button
              onClick={onOpenCharacterDrawer}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-primary hover:text-primary/80 hover:bg-secondary/50 active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {characters.length > 0
                  ? `角色库 (${characters.length})`
                  : "角色库"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
