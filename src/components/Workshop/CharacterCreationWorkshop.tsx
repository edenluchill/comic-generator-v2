"use client";

import { useState, useEffect } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { CaricatureAnalysis } from "@/types/caricature-analysis";
import { useTranslations } from "@/hooks/useTranslations";
import ImageUploadSection from "./ImageUploadSection";
import AnalysisResultSection from "./AnalysisResultSection";
import SketchResultSection from "./SketchResultSection";

export default function CharacterCreationWorkshop() {
  const t = useTranslations("WorkshopPage");

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<CaricatureAnalysis | null>(null);
  const [sketchResult, setSketchResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    "analyzing" | "generating" | null
  >(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUploadedFile(file);
        setAnalysisResult(null);
        setSketchResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setSketchResult(null);
  };

  const handleAnalyzeAndGenerate = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingStep("analyzing");

    try {
      // 第一步：分析脸部结构
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const analysisResponse = await fetch("/api/analyze-face", {
        method: "POST",
        body: formData,
      });

      const analysisResult = await analysisResponse.json();

      if (!analysisResult.success) {
        throw new Error("分析失败: " + analysisResult.error);
      }

      setAnalysisResult(analysisResult.data);

      // 第二步：生成简笔画
      setProcessingStep("generating");

      const prompt = `simple line drawing sketch portrait, ${analysisResult.data.dominant_features.primary}, ${analysisResult.data.geometric_shapes.face_shape.base_shape} face, ${analysisResult.data.geometric_shapes.eyes.size} ${analysisResult.data.geometric_shapes.eyes.shape} eyes, ${analysisResult.data.geometric_shapes.nose.shape} nose, ${analysisResult.data.geometric_shapes.mouth.shape} mouth, ${analysisResult.data.style_recommendations.cartoon_style} style, ${analysisResult.data.style_recommendations.line_weight} lines, black and white sketch`;

      const generateFormData = new FormData();
      generateFormData.append("image", uploadedFile);
      generateFormData.append("prompt", prompt);
      generateFormData.append(
        "style",
        analysisResult.data.style_recommendations.cartoon_style
      );

      const generateResponse = await fetch("/api/generate-sketch", {
        method: "POST",
        body: generateFormData,
      });

      const generateResult = await generateResponse.json();

      if (generateResult.success) {
        setSketchResult(
          generateResult.data.imageUrl || generateResult.data.image
        );
      } else {
        throw new Error("生成简笔画失败: " + generateResult.error);
      }
    } catch (error) {
      console.error("Process failed:", error);
      alert(error instanceof Error ? error.message : "处理失败，请重试");
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  const getButtonContent = () => {
    if (!isProcessing) {
      return {
        icon: (
          <Wand2 className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        ),
        text: t("analyzeAndGenerate"),
      };
    }

    if (processingStep === "analyzing") {
      return {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        text: t("analyzingFeatures"),
      };
    }

    return {
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
      text: t("generatingSketch"),
    };
  };

  const buttonContent = getButtonContent();

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 标题区域 */}
        <div
          className={`text-center mb-6 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-amber-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* 响应式布局 - 移动端垂直，桌面端水平 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 lg:h-[60vh] lg:max-h-[500px]">
          {/* 左侧：上传图片区域 */}
          <ImageUploadSection
            uploadedImage={uploadedImage}
            uploadedFile={uploadedFile}
            isDragOver={isDragOver}
            mounted={mounted}
            onImageUpload={handleImageUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClearImage={handleClearImage}
          />

          {/* 中间：分析结果区域 */}
          <AnalysisResultSection
            analysisResult={analysisResult}
            processingStep={processingStep}
            mounted={mounted}
          />

          {/* 右侧：简笔画结果区域 */}
          <SketchResultSection
            sketchResult={sketchResult}
            processingStep={processingStep}
            mounted={mounted}
          />
        </div>

        {/* 底部操作按钮 - 移动端优化 */}
        <div className="mt-6 flex justify-center px-4">
          <button
            onClick={handleAnalyzeAndGenerate}
            disabled={!uploadedFile || isProcessing}
            className={`w-full max-w-md py-3 lg:py-3 px-6 lg:px-10 rounded-2xl font-bold text-sm lg:text-base transition-all duration-500 flex items-center justify-center gap-2 lg:gap-3 relative overflow-hidden group ${
              !uploadedFile || isProcessing
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            }`}
          >
            {!(!uploadedFile || isProcessing) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
            {buttonContent.icon}
            <span className="text-center">{buttonContent.text}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
