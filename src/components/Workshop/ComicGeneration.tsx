"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import CharactersList from "./CharactersList";
import DiaryInput from "./DiaryInput";
import ComicDisplay from "./ComicDisplay";

export default function ComicGeneration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characters = useAppSelector((state) => state.characters.characters);

  const [mounted, setMounted] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [comicUrl, setComicUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackToWorkshop = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("mode");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleAddNewCharacter = () => {
    // 切换到角色创建模式
    handleBackToWorkshop();
  };

  const handleGenerateComic = async () => {
    if (!storyText.trim() || characters.length === 0) return;

    setIsGenerating(true);
    try {
      // TODO: 实现漫画生成API调用
      // 这里暂时模拟一个生成过程
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 模拟生成结果
      setComicUrl("/api/placeholder-comic.jpg");
    } catch (error) {
      console.error("生成漫画失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate =
    storyText.trim().length > 0 && characters.length > 0 && !isGenerating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-7xl">
        {/* 标题和返回按钮 */}
        <div
          className={`flex items-center gap-4 mb-4 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <button
            onClick={handleBackToWorkshop}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-amber-700 hover:text-amber-800"
          >
            <ArrowLeft className="w-5 h-5" />
            返回工作室
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-800">
              漫画生成器
            </h1>
            <p className="text-amber-700 text-sm md:text-base">
              用你的角色和故事创作四格漫画
            </p>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="mb-4">
          <CharactersList
            onAddNewCharacter={handleAddNewCharacter}
            mounted={mounted}
          />
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          {/* 左列：日记输入 */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <DiaryInput
              value={storyText}
              onTextChange={setStoryText}
              disabled={isGenerating}
            />
          </div>

          {/* 右列：漫画显示 */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <ComicDisplay
              comicUrl={comicUrl}
              isGenerating={isGenerating}
              onGenerate={handleGenerateComic}
              canGenerate={canGenerate}
            />
          </div>
        </div>

        {/* 提示信息 */}
        {characters.length === 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
              💡 提示：你需要先创建角色才能生成漫画
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
