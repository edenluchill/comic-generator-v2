"use client";

import { Eye, Loader2 } from "lucide-react";
import { CaricatureAnalysis } from "@/types/caricature-analysis";
import { useTranslations } from "@/hooks/useTranslations";

interface AnalysisResultSectionProps {
  analysisResult: CaricatureAnalysis | null;
  processingStep: "analyzing" | "generating" | null;
  mounted: boolean;
}

export default function AnalysisResultSection({
  analysisResult,
  processingStep,
  mounted,
}: AnalysisResultSectionProps) {
  const t = useTranslations("WorkshopPage");

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 lg:p-6 border border-amber-100/50 overflow-y-auto transition-all duration-700 delay-200 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
        <div className="w-6 h-6 lg:w-8 lg:h-8 border-2 border-amber-400/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:border-amber-500 hover:scale-105">
          <Eye className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-amber-800">
          {t("analysisResults")}
        </h2>
      </div>

      {processingStep === "analyzing" && (
        <div className="flex flex-col items-center justify-center h-32 lg:h-40">
          <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-amber-400/50 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 animate-spin" />
          </div>
          <p className="text-sm lg:text-base text-amber-700 font-medium">
            {t("analyzingFeatures")}
          </p>
        </div>
      )}

      {analysisResult && processingStep !== "analyzing" && (
        <div className="space-y-3 lg:space-y-4">
          {/* 主要特征 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 lg:p-4">
            <h3 className="font-bold text-amber-800 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
              <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
              {t("dominantFeatures")}
            </h3>
            <div className="space-y-2">
              <div className="bg-white p-2 lg:p-3 rounded-lg border border-amber-100">
                <div className="font-medium text-amber-800 text-xs lg:text-sm">
                  {t("primaryFeature")}
                </div>
                <div className="text-amber-700 text-xs lg:text-sm">
                  {analysisResult.dominant_features.primary}
                </div>
              </div>
              <div className="bg-white p-2 lg:p-3 rounded-lg border border-amber-100">
                <div className="font-medium text-amber-800 text-xs lg:text-sm">
                  {t("secondaryFeatures")}
                </div>
                <div className="text-amber-700 text-xs lg:text-sm">
                  {analysisResult.dominant_features.secondary.join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* 几何形状 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 lg:p-4">
            <h3 className="font-bold text-orange-800 mb-2 lg:mb-3 text-xs lg:text-sm">
              {t("geometricShapes")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <div className="font-medium text-orange-800 text-xs">
                  {t("faceShape")}
                </div>
                <div className="text-orange-700 text-xs">
                  {analysisResult.geometric_shapes.face_shape.base_shape}
                </div>
              </div>
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <div className="font-medium text-orange-800 text-xs">
                  {t("eyes")}
                </div>
                <div className="text-orange-700 text-xs">
                  {analysisResult.geometric_shapes.eyes.shape}
                </div>
              </div>
            </div>
          </div>

          {/* 风格建议 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 lg:p-4">
            <h3 className="font-bold text-yellow-800 mb-2 lg:mb-3 text-xs lg:text-sm">
              {t("styleRecommendations")}
            </h3>
            <div className="bg-white p-2 lg:p-3 rounded-lg border border-yellow-100">
              <div className="font-medium text-yellow-800 text-xs lg:text-sm">
                {t("recommendedStyle")}
              </div>
              <div className="text-yellow-700 text-xs lg:text-sm">
                {analysisResult.style_recommendations.cartoon_style}
              </div>
            </div>
          </div>
        </div>
      )}

      {!analysisResult && processingStep !== "analyzing" && (
        <div className="text-center text-amber-600 mt-8 lg:mt-12">
          <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-amber-400/50 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
          </div>
          <p className="font-medium text-sm lg:text-base">
            {t("uploadToStart")}
          </p>
        </div>
      )}
    </div>
  );
}
