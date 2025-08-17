"use client";

import { Palette, Users, Trash2 } from "lucide-react";
import { Character } from "@/types/characters";
import Image from "next/image";
import { useState } from "react";
import CharacterDetailModal from "./CharacterDetailModal";
import { Loader } from "../ui/loading";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

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

  const handleDeleteCharacter = async (id: string) => {
    await onDelete(id);
    // 如果删除的是当前选中的角色，关闭 modal
    if (selectedCharacter?.id === id) {
      setSelectedCharacter(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[540px] bg-card/95 backdrop-blur-xl border-l border-border"
        >
          <SheetHeader className="bg-gradient-to-r from-secondary/50 to-accent/30 -m-6 mb-6 p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent/50 rounded-xl flex items-center justify-center border border-border">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>角色列表</SheetTitle>
                <SheetDescription>
                  {characters.length === 0
                    ? "暂无角色"
                    : `共 ${characters.length} 个角色`}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader message="加载角色库..." color="primary" size="md" />
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary to-accent/50 rounded-2xl flex items-center justify-center border border-border">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-foreground font-medium mb-2">
                  还没有创建角色
                </h4>
                <p className="text-muted-foreground text-sm">
                  先创建一个角色开始制作漫画
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="bg-gradient-to-r from-secondary/30 to-accent/20 rounded-lg p-3 group hover:from-secondary/50 hover:to-accent/30 transition-all duration-200 border border-border hover:border-primary/30 cursor-pointer"
                    onClick={() => setSelectedCharacter(character)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-card shadow-sm flex-shrink-0 group-hover:border-primary/30 transition-colors">
                        <Image
                          src={character.avatar_url}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {character.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
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
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部区域 */}
          <SheetFooter className="-mx-6 mt-6 p-6 border-t border-border bg-gradient-to-r from-secondary/50 to-accent/30">
            {characters.length > 0 ? (
              <button
                onClick={() => {
                  onStartComic();
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-chart-3 to-chart-4 hover:from-chart-3/80 hover:to-chart-4/80 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4" />
                开始制作漫画
              </button>
            ) : (
              <div className="text-center py-2">
                <p className="text-muted-foreground text-sm">
                  创建角色后即可开始制作漫画
                </p>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
