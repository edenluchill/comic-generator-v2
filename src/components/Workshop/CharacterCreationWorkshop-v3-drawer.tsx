"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  User,
  Palette,
  Lock,
  Users,
  X,
  Trash2,
} from "lucide-react";
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
import WorkshopHeader, { createBackAction } from "./WorkshopHeader";
import { Character } from "@/types/characters";
import Image from "next/image";

// 步骤卡片组件
function StepCard({
  step,
  title,
  description,
  icon: Icon,
  isActive,
  isCompleted,
  isLocked,
  children,
  actionButton,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  isActive: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  children?: React.ReactNode;
  actionButton?: { text: string; onClick: () => void; disabled?: boolean };
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
        isActive
          ? "border-blue-500 shadow-blue-100"
          : isCompleted
          ? "border-green-500 shadow-green-100"
          : isLocked
          ? "border-gray-200 opacity-60"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-blue-500 text-white"
              : isLocked
              ? "bg-gray-300 text-gray-500"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-6 h-6" />
          ) : isLocked ? (
            <Lock className="w-6 h-6" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              步骤 {step}
            </span>
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <h3
            className={`text-lg font-semibold ${
              isLocked ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              isLocked ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {!isLocked && children && <div className="mb-4">{children}</div>}

      {!isLocked && actionButton && (
        <div className="flex justify-center">
          <button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              actionButton.disabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isActive
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {actionButton.text}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">完成上一步后解锁</div>
        </div>
      )}
    </div>
  );
}

// 右侧角色抽屉组件
function CharacterDrawer({
  isOpen,
  onClose,
  characters,
  onAddNew,
  onDelete,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddNew: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="fixed top-20 right-6 z-9999 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-amber-200/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="text-sm font-medium text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 抽屉 */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              我的角色库 ({characters.length})
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 角色列表 */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="bg-gray-50 rounded-xl p-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={character.avatar_url}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {character.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(character.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(character.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部操作 */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onAddNew();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              + 创建新角色
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 浮动角色预览按钮
function FloatingCharacterButton({
  characters,
  onClick,
  loading,
}: {
  characters: Character[];
  onClick: () => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="fixed top-20 right-6 z-9999 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-amber-200/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="text-sm font-medium text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (characters.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-20 right-6 z-9999 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all group"
    >
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {characters.slice(0, 2).map((character) => (
            <div
              key={character.id}
              className="w-6 h-6 rounded-full border border-white overflow-hidden shadow-sm"
            >
              <Image
                src={character.avatar_url}
                alt={character.name}
                className="w-full h-full object-cover"
                width={32}
                height={32}
              />
            </div>
          ))}
        </div>
        <div className="text-sm font-medium text-gray-700">
          已有{characters.length} 个角色
        </div>
        <Users className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
      </div>
    </button>
  );
}
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
    navigate("/");
  }, [navigate]);

  const canGenerate = uploadedFile && !isProcessing;
  const isCreatingCharacter = createCharacterMutation.isPending;

  const backAction = createBackAction(
    ArrowLeft,
    "返回控制台",
    "控制台",
    handleBackToDashboard
  );

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
        <WorkshopHeader leftAction={backAction} mounted={mounted} />

        {/* 浮动角色按钮 */}
        <FloatingCharacterButton
          characters={characters}
          onClick={() => setIsDrawerOpen(true)}
          loading={isLoading}
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
                <div className="text-gray-600 text-sm">
                  现在可以使用 {characters.length} 个角色来创作你的专属漫画了
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

        {/* 角色抽屉 */}
        <CharacterDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          characters={characters}
          onAddNew={handleAddNewCharacter}
          onDelete={handleDeleteCharacter}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
