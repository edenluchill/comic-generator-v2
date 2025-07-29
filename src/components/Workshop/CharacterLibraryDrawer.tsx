import { Palette, Users, Trash2 } from "lucide-react";
import { Character } from "@/types/characters";
import Image from "next/image";
import { MobileDrawer } from "@/components/ui/mobile-drawer";
import { useState } from "react";
import CharacterDetailModal from "./CharacterDetailModal";
import { Loader } from "../ui/loading";

export interface CharacterLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onDelete: (id: string) => void;
  onStartComic: () => void;
  loading: boolean;
}

export function CharacterLibraryDrawer({
  isOpen,
  onClose,
  characters,
  onDelete,
  onStartComic,
  loading,
}: CharacterLibraryDrawerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  if (loading) {
    return (
      <div className="p-4">
        <Loader message="加载角色库..." color="primary" size="md" />
      </div>
    );
  }

  const handleDeleteCharacter = async (id: string) => {
    await onDelete(id);
    // 如果删除的是当前选中的角色，关闭 modal
    if (selectedCharacter?.id === id) {
      setSelectedCharacter(null);
    }
  };

  const footer =
    characters.length > 0 ? (
      <button
        onClick={() => {
          onStartComic();
          onClose();
        }}
        className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
      >
        <Palette className="w-4 h-4" />
        开始制作漫画
      </button>
    ) : (
      <div className="text-center py-2">
        <p className="text-amber-600/60 text-sm">创建角色后即可开始制作漫画</p>
      </div>
    );

  return (
    <>
      <MobileDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="角色列表"
        subtitle={
          characters.length === 0
            ? "暂无角色"
            : `共 ${characters.length} 个角色`
        }
        icon={<Users className="w-5 h-5 text-amber-600" />}
        footer={footer}
      >
        {/* 角色列表内容 */}
        {characters.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <Users className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="text-gray-800 font-medium mb-2">还没有创建角色</h4>
            <p className="text-gray-500 text-sm">先创建一个角色开始制作漫画</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((character) => (
              <div
                key={character.id}
                className="bg-gradient-to-r from-amber-50/30 to-orange-50/30 rounded-lg p-3 group hover:from-amber-50 hover:to-orange-50 transition-all duration-200 border border-amber-100/50 hover:border-amber-200/50 cursor-pointer"
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image
                      src={character.avatar_url}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {character.name}
                    </h4>
                    <p className="text-xs text-amber-600/60">
                      创建于{" "}
                      {new Date(character.created_at).toLocaleDateString(
                        "zh-CN",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止冒泡，避免触发角色详情
                      onDelete(character.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileDrawer>

      {/* 角色详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onDelete={handleDeleteCharacter}
        />
      )}
    </>
  );
}
