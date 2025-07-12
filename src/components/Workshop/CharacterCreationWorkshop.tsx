"use client";

import { useState, useEffect } from "react";
import { Wand2, BookOpen } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useFluxGeneration } from "@/hooks/useFluxGeneration";
import { useRouter, useSearchParams } from "next/navigation";
import UploadAnalysisSection from "./UploadAnalysisSection";
import AvatarDisplaySection from "./AvatarDisplaySection";
import CharactersList from "./CharactersList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addCharacter } from "@/store/slices/charactersSlice";

export default function CharacterCreationWorkshop() {
  const t = useTranslations("WorkshopPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const characters = useAppSelector((state) => state.characters.characters);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [characterSaved, setCharacterSaved] = useState(false);

  // 使用Redux
  const dispatch = useAppDispatch();

  // 使用Flux生成hook
  const {
    isProcessing,
    currentStep,
    totalSteps,
    progress,
    status,
    message,
    avatarResult,
    threeViewResult,
    tags,
    error,
    processingStep,
    generateCharacter,
    reset: resetFlux,
  } = useFluxGeneration();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUploadedFile(file);
        resetFlux(); // 重置Flux状态，包括分析结果
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    resetFlux();
  };

  const handleFluxGeneration = async () => {
    if (!uploadedFile || !uploadedImage) return;

    try {
      await generateCharacter({
        uploadedFile,
        uploadedImage,
      });
    } catch (error) {
      console.error("生成失败:", error);
    }
  };

  // 处理保存角色
  const handleSaveCharacter = (characterName: string) => {
    if (avatarResult?.imageUrl && threeViewResult?.imageUrl) {
      const newCharacter = {
        id: `character_${Date.now()}`,
        name: characterName,
        avatarUrl: avatarResult.imageUrl,
        threeViewUrl: threeViewResult.imageUrl,
        createdAt: new Date().toISOString(),
      };

      dispatch(addCharacter(newCharacter));
      setCharacterSaved(true);
    }
  };

  // 处理添加新角色
  const handleAddNewCharacter = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setCharacterSaved(false);
    resetFlux();
  };

  // 切换到漫画生成页面
  const handleSwitchToComic = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "comic");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  // 显示错误信息
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* 背景装饰元素 - 调整为更轻的装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-7xl">
        {/* 标题区域 - 减少间距 */}
        <div
          className={`text-center mb-3 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-amber-700 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* 角色列表 - 减少间距 */}
        <div className="mb-4">
          <CharactersList
            onAddNewCharacter={handleAddNewCharacter}
            mounted={mounted}
          />
        </div>

        {/* 主要内容区域 - 移除固定高度，使用自适应 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
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
              isProcessing={isProcessing}
              progress={progress}
              status={status}
              avatarResult={avatarResult}
              threeViewResult={threeViewResult}
              onSaveCharacter={handleSaveCharacter}
              isSaved={characterSaved}
            />
          </div>
        </div>

        {/* 底部操作区域 - 减少间距并优化按钮区域 */}
        <div className="space-y-3">
          {/* 操作按钮 */}
          <div className="flex justify-center gap-3 px-2">
            <button
              onClick={handleFluxGeneration}
              disabled={!uploadedFile || isProcessing}
              className={`flex-1 max-w-sm py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden ${
                !uploadedFile || isProcessing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              <Wand2 className="w-5 h-5" />
              <span className="text-center">
                {isProcessing
                  ? `${
                      currentStep === 1
                        ? "生成头像"
                        : currentStep === 2
                        ? "生成3视图"
                        : "分析"
                    }中...`
                  : "分析并生成角色"}
              </span>
            </button>

            {/* 漫画生成按钮 */}
            <button
              onClick={handleSwitchToComic}
              disabled={isProcessing || !characters || characters.length === 0}
              className={`flex-1 max-w-sm py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden ${
                isProcessing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>生成漫画</span>
            </button>
          </div>

          {/* 进度指示器 - 更紧凑 */}
          {isProcessing && (
            <div className="max-w-sm mx-auto px-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>
                  步骤 {currentStep} / {totalSteps}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              {message && (
                <p className="text-xs text-center text-gray-500 mt-1">
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
