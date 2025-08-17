"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CharactersList from "./CharactersList";
import DiaryInput from "./DiaryInput";
import ComicDisplay from "./ComicDisplay";
import WorkshopHeader, { createBackAction } from "./WorkshopHeader";
import { useCharacters, useDeleteCharacter } from "@/hooks/useCharacters";
import { useComicGeneration } from "@/hooks/useComicGeneration";
import { Character } from "@/types/characters";
import { ComicFormat, LayoutMode } from "@/types/diary";

// localStorage 键名常量
const COMIC_FORMAT_STORAGE_KEY = "comic-generator-format-preference";

// 从 localStorage 读取格式偏好
const getStoredFormat = (): ComicFormat => {
  if (typeof window === "undefined") return "four"; // SSR 安全

  try {
    const stored = localStorage.getItem(COMIC_FORMAT_STORAGE_KEY);
    if (stored && (stored === "single" || stored === "four")) {
      return stored as ComicFormat;
    }
  } catch (error) {
    console.warn(
      "Failed to read comic format preference from localStorage:",
      error
    );
  }

  return "four"; // 默认值
};

// 保存格式偏好到 localStorage
const saveFormatPreference = (format: ComicFormat) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COMIC_FORMAT_STORAGE_KEY, format);
  } catch (error) {
    console.warn(
      "Failed to save comic format preference to localStorage:",
      error
    );
  }
};

export default function ComicGeneration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: characters = [], isLoading } = useCharacters();
  const deleteCharacterMutation = useDeleteCharacter();
  const {
    isGenerating,
    progress,
    message,
    currentScene,
    totalScenes,
    result,
    error,
    generateComic,
    retryScene,
  } = useComicGeneration();

  const [mounted, setMounted] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [selectedStyle] = useState<"cute" | "realistic" | "minimal" | "kawaii">(
    "cute"
  );

  // 修改状态初始化 - 从 localStorage 读取上次选择
  const [comicFormat, setComicFormat] = useState<ComicFormat>(() => {
    return getStoredFormat();
  });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-2x2");

  useEffect(() => {
    setMounted(true);
    // 组件挂载后，确保状态与 localStorage 同步
    setComicFormat(getStoredFormat());
  }, []);

  // 处理格式变更的函数
  const handleFormatChange = (newFormat: ComicFormat) => {
    setComicFormat(newFormat);
    saveFormatPreference(newFormat);
  };

  const handleBackToWorkshop = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("mode");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleAddNewCharacter = () => {
    // 切换到角色创建模式
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "character");
    router.push(`/workshop?${newSearchParams.toString()}`);
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

  const handleGenerateComic = async () => {
    if (!storyText.trim() || characters.length === 0) return;

    try {
      const characterData = characters.map((c: Character) => ({
        id: c.id,
        name: c.name,
        avatar_url: c.avatar_url,
      }));
      await generateComic({
        diary_content: storyText,
        characters: characterData,
        style: selectedStyle,
        format: comicFormat, // 只传format，不传layout_mode
      });
    } catch (error) {
      console.error("生成漫画失败:", error);
    }
  };

  const handleRetryScene = async (sceneId: string, newDescription: string) => {
    try {
      await retryScene(sceneId, newDescription);
    } catch (error) {
      console.error("重试场景失败:", error);
      // 可以在这里添加错误提示
    }
  };

  const canGenerate =
    storyText.trim().length > 0 && characters.length > 0 && !isGenerating;

  // Header配置
  const backAction = createBackAction(
    ArrowLeft,
    "返回工作室",
    "工作室",
    handleBackToWorkshop
  );

  return (
    <div className="min-h-screen bg-theme-gradient relative">
      {/* 背景装饰元素 - 使用主题色彩 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-6xl">
        {/* 使用可重用的Header组件 */}
        <WorkshopHeader
          leftAction={backAction}
          title="用你的角色和故事创作四格漫画"
          mounted={mounted}
        />

        {/* 角色列表 */}
        <div className="mb-4">
          <CharactersList
            onAddNewCharacter={handleAddNewCharacter}
            mounted={mounted}
            characters={characters}
            loading={isLoading}
            onDeleteCharacter={handleDeleteCharacter}
          />
        </div>

        {/* 删除错误信息 - 使用主题色彩 */}
        {deleteCharacterMutation.error && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
              ❌ {deleteCharacterMutation.error.message}
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              isGenerating={isGenerating}
              onGenerate={handleGenerateComic}
              canGenerate={canGenerate}
              progress={progress}
              progressMessage={message}
              currentScene={currentScene}
              totalScenes={totalScenes}
              scenes={result?.scenes}
              error={error}
              onRetryScene={handleRetryScene}
              format={comicFormat}
              onFormatChange={handleFormatChange} // 使用新的处理函数
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
            />
          </div>
        </div>

        {/* 提示信息 - 使用主题色彩 */}
        {characters.length === 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1/10 text-chart-1 rounded-lg text-sm border border-chart-1/20">
              💡 提示：你需要先创建角色才能生成漫画
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
