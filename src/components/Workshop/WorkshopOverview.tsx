"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CharactersList from "./CharactersList";
import DiaryList from "./DiaryList";
import { useCharacters } from "@/hooks/useCharacters";
import { DiaryWithComics } from "@/hooks/useDiaries";

export default function WorkshopOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const { data: characters = [], isLoading: charactersLoading } =
    useCharacters();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* 背景装饰 - 添加明确的 z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-6 relative z-10 max-w-7xl">
        {/* 欢迎区域 */}
        <div
          className={`text-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-amber-800 mb-3">
            创作工作室
          </h1>
          <p className="text-amber-700 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            上传图片，分析面部特征，生成专属漫画角色
          </p>
        </div>

        {/* 内容区域 - 改为纵向布局 */}
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
              onDeleteCharacter={async (id) => {
                // 实现删除逻辑
                console.log("删除角色:", id);
              }}
            />
          </div>

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

        {/* 底部提示 */}
        <div
          className={`mt-8 text-center transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
            <Sparkles className="w-4 h-4" />
            <span>提示：先创建角色，再写日记生成漫画</span>
          </div>
        </div>
      </div>
    </div>
  );
}
