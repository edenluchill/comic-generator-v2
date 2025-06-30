"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, Eye, Sparkles, ImageIcon, Wand2 } from "lucide-react";
import { CaricatureAnalysis } from "@/types/caricature-analysis";

export default function WorkshopPage() {
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

  // 添加挂载动画
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

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
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

  // 合并的分析和生成函数
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

  // 获取按钮文本和图标
  const getButtonContent = () => {
    if (!isProcessing) {
      return {
        icon: (
          <Wand2 className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        ),
        text: "分析并生成简笔画",
      };
    }

    if (processingStep === "analyzing") {
      return {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        text: "正在分析脸部特征...",
      };
    }

    return {
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
      text: "正在生成简笔画...",
    };
  };

  const buttonContent = getButtonContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 标题区域 - 增强动画 */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="relative inline-block">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 relative">
              AI Comic Generator Workshop
              {/* 标题装饰 */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-bounce opacity-80" />
            </h1>
          </div>
          <p className="text-gray-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            上传图片，分析脸部特征，生成专属简笔画角色
          </p>
        </div>

        {/* 三列布局 - 增强间距和阴影 */}
        <div className="grid grid-cols-3 gap-10 h-[calc(100vh-240px)]">
          {/* 左侧：上传图片区域 - 增强视觉效果 */}
          <div
            className={`bg-gradient-to-br from-white/95 to-blue-50/50 rounded-2xl shadow-2xl p-10 border border-white/60 backdrop-blur-lg transition-all duration-700 delay-100 relative overflow-hidden ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            {/* 卡片内部装饰 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  上传图片
                </h2>
              </div>

              {/* 图片上传区域 */}
              <div className="mb-8">
                {!uploadedImage ? (
                  <div
                    className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden group ${
                      isDragOver
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 scale-105 shadow-2xl"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-102 hover:shadow-xl"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    {/* 动态背景装饰 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* 浮动装饰元素 */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-pulse opacity-60" />
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse opacity-40 delay-300" />
                    <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse opacity-50 delay-700" />

                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 transition-all duration-700 shadow-xl ${
                          isDragOver
                            ? "scale-125 rotate-12 shadow-2xl"
                            : "group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-2xl"
                        }`}
                      >
                        <div className="relative">
                          <ImageIcon className="w-12 h-12 text-white drop-shadow-lg" />
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce">
                            <div className="w-full h-full bg-white/30 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800 mb-3 transition-colors duration-300 group-hover:text-blue-600">
                        拖拽图片到这里
                      </h3>
                      <p className="text-gray-600 mb-6 font-medium text-lg transition-colors duration-300 group-hover:text-gray-700">
                        或者点击选择文件
                      </p>

                      <div className="flex items-center gap-3 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 transition-all duration-300 group-hover:bg-white/80 group-hover:border-blue-200/50">
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-sm" />
                        <span className="font-medium">
                          支持 JPG, PNG, GIF 格式
                        </span>
                      </div>
                    </div>

                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    {/* 图片容器with更好的阴影和圆角 */}
                    <div className="relative border-2 border-gray-200 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* 悬浮时的遮罩层 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* 图片信息悬浮显示 */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {uploadedFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {uploadedFile &&
                            (uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>

                    {/* 优雅的关闭按钮 */}
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedFile(null);
                        setAnalysisResult(null);
                        setSketchResult(null);
                      }}
                      className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 hover:from-red-600 hover:to-pink-600 group/btn"
                    >
                      <div className="relative">
                        {/* X 图标 */}
                        <svg
                          className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>

                        {/* 按钮光效 */}
                        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                      </div>

                      {/* 外围光圈 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full scale-110 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300 animate-pulse" />
                    </button>

                    {/* 重新上传的悬浮按钮 */}
                    <button
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-lg transform -translate-y-2 group-hover:translate-y-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">重新上传</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 合并的分析生成按钮 */}
              <button
                onClick={handleAnalyzeAndGenerate}
                disabled={!uploadedFile || isProcessing}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${
                  !uploadedFile || isProcessing
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                }`}
              >
                {/* 按钮背景动画 */}
                {!(!uploadedFile || isProcessing) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}

                {buttonContent.icon}
                <span>{buttonContent.text}</span>
              </button>
            </div>
          </div>

          {/* 中间：分析结果区域 */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 overflow-y-auto transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              分析结果
            </h2>

            {processingStep === "analyzing" && (
              <div className="flex flex-col items-center justify-center h-64 animate-pulse">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  正在分析脸部特征...
                </p>
              </div>
            )}

            {analysisResult && processingStep !== "analyzing" && (
              <div className="space-y-6 animate-fadeIn">
                {/* 主要特征 */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-lg">
                    <Eye className="w-5 h-5" />
                    主要特征
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">主要特征</div>
                      <div className="text-gray-600">
                        {analysisResult.dominant_features.primary}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">次要特征</div>
                      <div className="text-gray-600">
                        {analysisResult.dominant_features.secondary.join(", ")}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">独特特征</div>
                      <div className="text-gray-600">
                        {analysisResult.dominant_features.unique_traits.join(
                          ", "
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 几何形状 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-bold text-blue-800 mb-4 text-lg">
                    几何形状
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">脸型</div>
                      <div className="text-gray-600">
                        {analysisResult.geometric_shapes.face_shape.base_shape}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">眼睛</div>
                      <div className="text-gray-600">
                        {analysisResult.geometric_shapes.eyes.shape}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">鼻子</div>
                      <div className="text-gray-600">
                        {analysisResult.geometric_shapes.nose.shape}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">嘴巴</div>
                      <div className="text-gray-600">
                        {analysisResult.geometric_shapes.mouth.shape}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 风格建议 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-bold text-purple-800 mb-4 text-lg">
                    风格建议
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-purple-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">推荐风格</div>
                      <div className="text-gray-600">
                        {analysisResult.style_recommendations.cartoon_style}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-purple-100 transition-all duration-300 hover:shadow-md">
                      <div className="font-bold text-gray-800">线条粗细</div>
                      <div className="text-gray-600">
                        {analysisResult.style_recommendations.line_weight}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!analysisResult && processingStep !== "analyzing" && (
              <div className="text-center text-gray-500 mt-20">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium">
                  上传图片并点击分析按钮开始分析
                </p>
              </div>
            )}
          </div>

          {/* 右侧：简笔画结果区域 */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              简笔画角色
            </h2>

            {processingStep === "generating" && (
              <div className="flex flex-col items-center justify-center h-64 animate-pulse">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  正在生成简笔画...
                </p>
              </div>
            )}

            {sketchResult ? (
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl animate-fadeIn">
                <img
                  src={sketchResult}
                  alt="Generated Sketch"
                  className="w-full h-64 object-cover"
                />
              </div>
            ) : (
              processingStep !== "generating" && (
                <div className="text-center text-gray-500 mt-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>点击按钮开始分析并生成简笔画</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
