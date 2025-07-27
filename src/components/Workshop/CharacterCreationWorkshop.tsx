"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wand2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSearchParams } from "next/navigation";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
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
import { useCharacterGeneration } from "@/hooks/useCharacterGeneration";
import WorkshopHeader, {
  createBackAction,
  createForwardAction,
} from "./WorkshopHeader";

export default function CharacterCreationWorkshop() {
  const t = useTranslations("WorkshopPage");
  const { navigate } = useLocalizedNavigation();
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

  // 使用角色生成hook
  const {
    isProcessing,
    currentStep,
    progress,
    status,
    avatarResult,
    threeViewResult,
    // tags,
    // processingStep,
    generateCharacter,
    reset: resetCharacterGeneration,
  } = useCharacterGeneration();

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
          resetCharacterGeneration();
        };
        reader.readAsDataURL(file);
      }
    },
    [resetCharacterGeneration]
  );

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedFile(null);
    resetCharacterGeneration();
  }, [resetCharacterGeneration]);

  const handleCharacterGeneration = useCallback(async () => {
    if (!uploadedFile) return;

    try {
      await generateCharacter({
        uploadedFile,
      });
    } catch (error) {
      console.error("生成失败:", error);
    }
  }, [uploadedFile, generateCharacter]);

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
    resetCharacterGeneration();
  }, [resetCharacterGeneration]);

  const handleSwitchToComic = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "comic");
    navigate(`/workshop?${newSearchParams.toString()}`);
  }, [searchParams, navigate]);

  const handleBackToDashboard = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // 简化的计算属性
  const canGenerate = uploadedFile && !isProcessing;
  const canSwitchToComic = !isProcessing && characters.length > 0;

  // 检查是否正在创建角色
  const isCreatingCharacter = createCharacterMutation.isPending;

  // Header配置
  const backAction = createBackAction(
    ArrowLeft,
    "返回控制台",
    "控制台",
    handleBackToDashboard
  );

  const forwardAction = createForwardAction(
    ArrowRight,
    "创作漫画",
    "漫画",
    handleSwitchToComic,
    !canSwitchToComic
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-6xl">
        {/* 使用可重用的Header组件 */}
        <WorkshopHeader
          leftAction={backAction}
          title={t("subtitle")}
          rightAction={forwardAction}
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

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 左列：上传和分析 */}
          <div className="order-1 xl:order-1">
            <UploadAnalysisSection
              uploadedImage={uploadedImage}
              uploadedFile={uploadedFile}
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

        {/* 在保存角色成功后显示明显的下一步提示 */}
        {characterSaved && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white shadow-2xl rounded-2xl p-6 border border-green-200 animate-bounce-once">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    角色创建成功！
                  </h3>
                  <p className="text-sm text-gray-600">
                    现在可以用这个角色创作漫画了
                  </p>
                </div>
                <button
                  onClick={handleSwitchToComic}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  立即创作
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 当用户首次创建角色时显示提示 */}
        {characters.length === 1 &&
          !localStorage.getItem("comic-tip-shown") && (
            <div className="absolute top-16 right-4 z-10">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      太棒了！现在可以点击右上角创作漫画了
                    </p>
                    <button
                      onClick={() =>
                        localStorage.setItem("comic-tip-shown", "true")
                      }
                      className="text-xs text-yellow-600 underline mt-1"
                    >
                      知道了
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* 底部操作区域 - 只保留生成按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleCharacterGeneration}
            disabled={!canGenerate}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              canGenerate
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Wand2 className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isProcessing ? "生成中..." : "开始生成"}
            </span>
            <span className="inline sm:hidden">
              {isProcessing ? "生成中" : "生成"}
            </span>
          </button>

          {characters.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-gray-500">下一步</div>
              <button
                onClick={handleSwitchToComic}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                创作漫画
              </button>
            </div>
          )}
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
