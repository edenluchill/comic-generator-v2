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
import { Character } from "@/types/characters";
import Image from "next/image";
import { MobileDrawer } from "@/components/ui/mobile-drawer";

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

// 顶部导航栏组件
function NavigationBar({
  onBack,
  characters,
  onOpenCharacterDrawer,
  loading,
  mounted,
}: {
  onBack: () => void;
  characters: Character[];
  onOpenCharacterDrawer: () => void;
  loading: boolean;
  mounted: boolean;
}) {
  return (
    <div
      className={`
        flex items-center justify-between mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50
        transition-all duration-1000 
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      {/* 左侧：返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-amber-600 hover:text-amber-700 hover:bg-white/50 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">返回控制台</span>
      </button>

      {/* 右侧：角色库信息 */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            <div className="text-sm font-medium text-gray-500">加载中...</div>
          </div>
        ) : (
          <>
            {/* 角色预览 */}
            {characters.length > 0 && (
              <div className="flex -space-x-1">
                {characters.slice(0, 3).map((character) => (
                  <div
                    key={character.id}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm"
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
            )}

            {/* 角色库按钮 */}
            <button
              onClick={onOpenCharacterDrawer}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-amber-600 hover:text-amber-700 hover:bg-white/50 active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {characters.length > 0
                  ? `角色库 (${characters.length})`
                  : "角色库"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// 替换原有的CharacterDrawer组件
function CharacterDrawer({
  isOpen,
  onClose,
  characters,
  onDelete,
  onStartComic,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onDelete: (id: string) => void;
  onStartComic: () => void;
  loading: boolean;
}) {
  if (loading) {
    return null;
  }

  const footer =
    characters.length > 0 ? (
      <button
        onClick={() => {
          onStartComic();
          onClose();
        }}
        className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
      >
        <Palette className="w-4 h-4" />
        开始制作漫画
      </button>
    ) : (
      <div className="text-center py-2">
        <p className="text-amber-600/60 text-sm">创建角色后即可开始制作漫画</p>
      </div>
    );

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="角色列表"
      subtitle={
        characters.length === 0 ? "暂无角色" : `共 ${characters.length} 个角色`
      }
      icon={<Users className="w-5 h-5 text-amber-600" />}
      footer={footer}
    >
      {/* 角色列表内容 */}
      {characters.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center border border-amber-100">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <h4 className="text-gray-800 font-medium mb-2">还没有创建角色</h4>
          <p className="text-gray-500 text-sm">先创建一个角色开始制作漫画</p>
        </div>
      ) : (
        <div className="space-y-3">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-gradient-to-r from-amber-50/30 to-orange-50/30 rounded-lg p-3 group hover:from-amber-50 hover:to-orange-50 transition-all duration-200 border border-amber-100/50 hover:border-amber-200/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <Image
                    src={character.avatar_url}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {character.name}
                  </h4>
                  <p className="text-xs text-amber-600/60">
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
                  onClick={() => onDelete(character.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileDrawer>
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
        {/* 新的导航栏 */}
        <NavigationBar
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

        {/* 角色抽屉 */}
        <CharacterDrawer
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
