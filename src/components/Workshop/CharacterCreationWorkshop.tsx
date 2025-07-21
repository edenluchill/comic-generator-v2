"use client";

import { useState, useEffect, useCallback } from "react";
import { Wand2, BookOpen } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useFluxGeneration } from "@/hooks/useFluxGeneration";
import { useRouter, useSearchParams } from "next/navigation";
import UploadAnalysisSection from "./UploadAnalysisSection";
import AvatarDisplaySection from "./AvatarDisplaySection";
import CharactersList from "./CharactersList";
// 替换 Redux imports
import {
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
} from "@/hooks/useCharacters";
import { useAuth } from "@/hooks/useAuth";

export default function CharacterCreationWorkshop() {
  const t = useTranslations("WorkshopPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // 使用新的 TanStack Query hooks
  const { data: characters = [], error, isLoading } = useCharacters();
  const createCharacterMutation = useCreateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();

  // 简化状态管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [characterSaved, setCharacterSaved] = useState(false);

  // 使用Flux生成hook
  const {
    isProcessing,
    currentStep,
    progress,
    status,
    avatarResult,
    threeViewResult,
    tags,
    processingStep,
    generateCharacter,
    reset: resetFlux,
  } = useFluxGeneration();

  // 不再需要手动获取角色列表的 useEffect - TanStack Query 自动处理

  useEffect(() => {
    setMounted(true);
  }, []);

  // 错误处理
  useEffect(() => {
    if (error) {
      console.error("Characters error:", error);
    }
  }, [error]);

  // 优化的处理函数，使用useCallback防止重新渲染
  const handleImageUpload = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          setUploadedFile(file);
          resetFlux();
        };
        reader.readAsDataURL(file);
      }
    },
    [resetFlux]
  );

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedFile(null);
    resetFlux();
  }, [resetFlux]);

  const handleFluxGeneration = useCallback(async () => {
    if (!uploadedFile || !uploadedImage) return;

    try {
      await generateCharacter({
        uploadedFile,
        uploadedImage,
      });
    } catch (error) {
      console.error("生成失败:", error);
    }
  }, [uploadedFile, uploadedImage, generateCharacter]);

  const handleSaveCharacter = useCallback(
    async (characterName: string) => {
      if (avatarResult?.imageUrl && threeViewResult?.imageUrl && user) {
        try {
          // 使用新的 mutation hook
          await createCharacterMutation.mutateAsync({
            name: characterName,
            avatarUrl: avatarResult.imageUrl,
            threeViewUrl: threeViewResult.imageUrl,
          });

          setCharacterSaved(true);
        } catch (error) {
          console.error("保存角色失败:", error);
        }
      }
    },
    [
      avatarResult?.imageUrl,
      threeViewResult?.imageUrl,
      user,
      createCharacterMutation,
    ]
  );

  const handleDeleteCharacter = useCallback(
    async (id: string) => {
      try {
        await deleteCharacterMutation.mutateAsync(id);
        // 可以在这里添加成功提示
      } catch (error) {
        console.error("删除角色失败:", error);
        // 可以在这里添加错误提示
      }
    },
    [deleteCharacterMutation]
  );

  const handleAddNewCharacter = useCallback(() => {
    setUploadedImage(null);
    setUploadedFile(null);
    setCharacterSaved(false);
    resetFlux();
  }, [resetFlux]);

  const handleSwitchToComic = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "comic");
    router.push(`/workshop?${newSearchParams.toString()}`);
  }, [searchParams, router]);

  // 简化的计算属性
  const canGenerate = uploadedFile && !isProcessing;
  const canSwitchToComic = !isProcessing && characters.length > 0;

  // 检查是否正在创建角色
  const isCreatingCharacter = createCharacterMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-7xl">
        {/* 标题 */}
        <div
          className={`text-center mb-3 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-amber-700 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

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

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 左列：上传和分析 */}
          <div className="order-1 xl:order-1">
            <UploadAnalysisSection
              uploadedImage={uploadedImage}
              uploadedFile={uploadedFile}
              tags={tags}
              processingStep={processingStep}
              mounted={mounted}
              onImageUpload={handleImageUpload}
              onClearImage={handleClearImage}
            />
          </div>

          {/* 右列：头像显示和3视图 */}
          <div className="order-2 xl:order-2">
            <AvatarDisplaySection
              currentStep={currentStep}
              isProcessing={isProcessing || isCreatingCharacter}
              progress={progress}
              status={status}
              avatarResult={avatarResult}
              threeViewResult={threeViewResult}
              onSaveCharacter={handleSaveCharacter}
              isSaved={characterSaved}
            />
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* 生成按钮 */}
          <button
            onClick={handleFluxGeneration}
            disabled={!canGenerate}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              canGenerate
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Wand2 className="w-5 h-5" />
            {isProcessing ? "生成中..." : "开始生成"}
          </button>

          {/* 创作漫画按钮 */}
          <button
            onClick={handleSwitchToComic}
            disabled={!canSwitchToComic}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              canSwitchToComic
                ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            创作漫画
          </button>
        </div>

        {/* 错误信息显示 */}
        {error && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              ❌ {error.message || error.toString()}
            </div>
          </div>
        )}

        {/* Mutation 错误信息 */}
        {createCharacterMutation.error && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              ❌ {createCharacterMutation.error.message}
            </div>
          </div>
        )}

        {/* 删除错误信息 */}
        {deleteCharacterMutation.error && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              ❌ {deleteCharacterMutation.error.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
