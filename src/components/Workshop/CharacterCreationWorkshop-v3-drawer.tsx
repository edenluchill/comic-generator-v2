"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, User, Palette, Users } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useSearchParams } from "next/navigation";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import UploadAnalysisSection from "./UploadAnalysisSection";
import AvatarDisplaySection from "./AvatarDisplaySection";
import GenerationSection from "./GenerationSection";
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
import { CharacterStyle } from "@/types/flux";

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

  // 风格选择状态
  const [selectedStyle, setSelectedStyle] = useState<CharacterStyle>("chibi");

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
      await generateCharacter({
        uploadedFile,
        style: selectedStyle,
      });
    } catch (error) {
      console.error(t("CharacterGeneration.generationFailed"), error);
    }
  }, [uploadedFile, selectedStyle, generateCharacter, t]);

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
          console.error(t("CharacterGeneration.saveCharacterFailed"), error);
        }
      }
    },
    [
      avatarResult?.imageUrl,
      threeViewResult?.imageUrl,
      user,
      createCharacterMutation,
      t,
    ]
  );

  const handleDeleteCharacter = useCallback(
    async (id: string) => {
      try {
        await deleteCharacterMutation.mutateAsync(id);
      } catch (error) {
        console.error(t("CharacterGeneration.deleteCharacterFailed"), error);
      }
    },
    [deleteCharacterMutation, t]
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

  const isCreatingCharacter = createCharacterMutation.isPending;

  // 步骤状态计算
  const step1Complete = !!uploadedFile;
  const step2Complete = characterSaved;

  return (
    <div className="min-h-screen bg-theme-gradient relative">
      {/* 背景装饰 - 使用主题色彩 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
            description={t("CharacterGeneration.step1Description")}
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
            title={t("CharacterGeneration.step2Title")}
            description={t("CharacterGeneration.step2Description")}
            icon={User}
            isActive={step1Complete && !step2Complete}
            isCompleted={step2Complete}
            isLocked={!step1Complete}
            actionButton={undefined}
          >
            {step1Complete && (
              <div className="mt-4 space-y-4">
                {/* 风格选择和生成按钮 */}
                <GenerationSection
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                  onGenerate={handleCharacterGeneration}
                  canGenerate={!!uploadedFile && !isProcessing}
                  isProcessing={isProcessing}
                  hasResults={!!avatarResult}
                  mounted={mounted}
                />

                {/* 结果显示 */}
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
            title={t("CharacterGeneration.step3Title")}
            description={t("CharacterGeneration.step3Description")}
            icon={Palette}
            isActive={false}
            isCompleted={false}
            isLocked={!step2Complete}
            actionButton={
              step2Complete
                ? {
                    text: t("CharacterGeneration.createComicNow"),
                    onClick: handleSwitchToComic,
                  }
                : undefined
            }
          >
            {step2Complete && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {t("CharacterGeneration.congratulations")}
                </div>
                <div className="text-muted-foreground text-sm mb-6">
                  {t("CharacterGeneration.canCreateComics", {
                    count: characters.length,
                  })}
                </div>

                {/* 调整次要按钮样式，使用主题色彩 */}
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={handleAddNewCharacter}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-transparent border border-border text-muted-foreground rounded-lg hover:bg-secondary/50 hover:text-foreground hover:border-primary/30 transition-all duration-200 text-xs font-normal"
                  >
                    <User className="w-3 h-3" />
                    {t("CharacterGeneration.addMoreCharacters")}
                  </button>

                  <div className="text-border text-xs">|</div>

                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-transparent border border-border text-muted-foreground rounded-lg hover:bg-secondary/50 hover:text-foreground hover:border-primary/30 transition-all duration-200 text-xs font-normal"
                  >
                    <Users className="w-3 h-3" />
                    {t("CharacterGeneration.viewCharacterLibrary")}
                  </button>
                </div>
              </div>
            )}
          </StepCard>
        </div>

        {/* 错误信息 - 使用主题色彩 */}
        {error && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
              ❌ {error.message || error.toString()}
            </div>
          </div>
        )}

        {/* 角色库抽屉 - 现在使用 Sheet */}
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
