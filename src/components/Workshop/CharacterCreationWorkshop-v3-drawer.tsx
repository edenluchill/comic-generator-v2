"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, User, Palette, Users } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSearchParams } from "next/navigation";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import UploadAnalysisSection from "./UploadAnalysisSection";
import AvatarDisplaySection from "./AvatarDisplaySection";
import {
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
} from "@/hooks/useCharacters";
import { useAuth } from "@/hooks/useAuth";
import { useCharacterGeneration } from "@/hooks/useCharacterGeneration";
import { StepCard } from "./StepCard";
import { CharacterWorkshopNavigationBar } from "./CharacterWorkshopNavigationBar";
import { CharacterLibraryDrawer } from "./CharacterLibraryDrawer";

export default function CharacterCreationWorkshop() {
  const t = useTranslations("WorkshopPage");
  const { navigate } = useLocalizedNavigation();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const { data: characters = [], error, isLoading } = useCharacters();
  const createCharacterMutation = useCreateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [characterSaved, setCharacterSaved] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    isProcessing,
    currentStep,
    progress,
    status,
    avatarResult,
    threeViewResult,
    generateCharacter,
    reset: resetCharacterGeneration,
  } = useCharacterGeneration();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      await generateCharacter({ uploadedFile });
    } catch (error) {
      console.error("生成失败:", error);
    }
  }, [uploadedFile, generateCharacter]);

  const handleSaveCharacter = useCallback(
    async (characterName: string) => {
      if (avatarResult?.imageUrl && threeViewResult?.imageUrl && user) {
        try {
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
      } catch (error) {
        console.error("删除角色失败:", error);
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
    navigate("/workshop");
  }, [navigate]);

  const canGenerate = uploadedFile && !isProcessing;
  const isCreatingCharacter = createCharacterMutation.isPending;

  // 步骤状态计算 - 合并第二步和第三步
  const step1Complete = !!uploadedFile;
  const step2Complete = characterSaved; // 现在第二步包括生成和保存

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-4xl">
        {/* 导航栏组件 */}
        <CharacterWorkshopNavigationBar
          onBack={handleBackToDashboard}
          characters={characters}
          onOpenCharacterDrawer={() => setIsDrawerOpen(true)}
          loading={isLoading}
          mounted={mounted}
        />

        {/* 分步流程卡片 */}
        <div className="space-y-6">
          <StepCard
            step={1}
            title={t("uploadImage")}
            description="选择一张清晰的人物照片，我们将基于这张照片生成角色"
            icon={Upload}
            isActive={!step1Complete}
            isCompleted={step1Complete}
          >
            <UploadAnalysisSection
              uploadedImage={uploadedImage}
              uploadedFile={uploadedFile}
              mounted={mounted}
              onImageUpload={handleImageUpload}
              onClearImage={handleClearImage}
            />
          </StepCard>

          <StepCard
            step={2}
            title="生成并保存角色"
            description="AI将为你生成专属的角色头像和三视图，并保存到你的角色库"
            icon={User}
            isActive={step1Complete && !step2Complete}
            isCompleted={step2Complete}
            isLocked={!step1Complete}
            actionButton={
              step1Complete && !step2Complete && !avatarResult
                ? {
                    text: isProcessing ? "生成中..." : "开始生成",
                    onClick: handleCharacterGeneration,
                    disabled: !canGenerate,
                  }
                : undefined
            }
          >
            {step1Complete && (
              <div className="mt-4">
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
            )}
          </StepCard>

          <StepCard
            step={3}
            title="创作漫画"
            description="使用你的角色开始创作专属漫画故事"
            icon={Palette}
            isActive={false}
            isCompleted={false}
            isLocked={!step2Complete}
            actionButton={
              step2Complete
                ? {
                    text: "立即创作漫画",
                    onClick: handleSwitchToComic,
                  }
                : undefined
            }
          >
            {step2Complete && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  恭喜！角色创建完成
                </div>
                <div className="text-gray-600 text-sm mb-6">
                  现在可以使用 {characters.length} 个角色来创作你的专属漫画了
                </div>

                {/* 添加更多角色按钮 */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleAddNewCharacter}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-amber-200 text-amber-600 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    添加更多角色
                  </button>

                  <div className="text-gray-300">|</div>

                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    查看角色库
                  </button>
                </div>
              </div>
            )}
          </StepCard>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              ❌ {error.message || error.toString()}
            </div>
          </div>
        )}

        {/* 角色库抽屉 */}
        <CharacterLibraryDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          characters={characters}
          onDelete={handleDeleteCharacter}
          onStartComic={handleSwitchToComic}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
