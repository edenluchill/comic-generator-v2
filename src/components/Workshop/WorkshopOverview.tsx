"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CharactersList from "./CharactersList";
import DiaryList from "./DiaryList";
import { useCharacters, useDeleteCharacter } from "@/hooks/useCharacters";
import { DiaryWithComics } from "@/hooks/useDiaries";

export default function WorkshopOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const { data: characters = [], isLoading: charactersLoading } =
    useCharacters();
  const deleteCharacterMutation = useDeleteCharacter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateNewCharacter = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "character");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleCreateNewDiary = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "comic");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleViewDiary = (diary: DiaryWithComics) => {
    // 可以跳转到详情页面或者在模态框中显示
    console.log("查看日记:", diary);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacterMutation.mutateAsync(id);
      // 可以在这里添加成功提示
    } catch (error) {
      console.error("删除角色失败:", error);
      // 可以在这里添加错误提示
    }
  };

  return (
    <div className="min-h-screen pb-8 bg-theme-gradient relative">
      {/* 背景装饰 - 使用主题色彩 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-2 relative z-10 max-w-6xl">
        {/* 标题 - 使用主题色彩 */}
        <div
          className={`mb-4 text-center transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg text-sm shadow-sm border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">
              提示：先创建角色，再写日记生成漫画
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* 角色列表 */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <CharactersList
              onAddNewCharacter={handleCreateNewCharacter}
              mounted={mounted}
              characters={characters}
              loading={charactersLoading}
              onDeleteCharacter={handleDeleteCharacter}
            />
          </div>

          {/* 错误提示 - 使用主题色彩 */}
          {deleteCharacterMutation.error && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
                ❌ {deleteCharacterMutation.error.message}
              </div>
            </div>
          )}

          {/* 日记列表 */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <DiaryList
              onCreateNewDiary={handleCreateNewDiary}
              onViewDiary={handleViewDiary}
              mounted={mounted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
