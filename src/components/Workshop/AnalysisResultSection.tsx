"use client";

import { Eye, Tag } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader } from "../ui/loading";

interface AnalysisResultSectionProps {
  tags: string[] | null;
  processingStep: "analyzing" | "generating" | "flux-generating" | null;
  mounted: boolean;
}

export default function AnalysisResultSection({
  tags,
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
          <Loader
            message={t("analyzingFeatures")}
            color="primary"
            size="md"
            iconSize={20}
          />
        </div>
      )}

      {tags && processingStep !== "analyzing" && (
        <div className="space-y-3 lg:space-y-4">
          {/* 识别的标签 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 lg:p-4">
            <h3 className="font-bold text-amber-800 mb-2 lg:mb-3 flex items-center gap-2 text-sm lg:text-base">
              <Tag className="w-3 h-3 lg:w-4 lg:h-4" />
              Identified Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-white px-3 py-1.5 rounded-full border border-amber-200 text-amber-700 text-xs lg:text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  {tag}
                </div>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-amber-600 text-sm italic">
                No tags identified
              </p>
            )}
          </div>

          {/* 标签统计 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 lg:p-4">
            <h3 className="font-bold text-orange-800 mb-2 lg:mb-3 text-xs lg:text-sm">
              Tag Summary
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <div className="font-medium text-orange-800 text-xs">
                  Total Tags
                </div>
                <div className="text-orange-700 text-lg font-bold">
                  {tags.length}
                </div>
              </div>
              <div className="bg-white p-2 rounded-md border border-orange-100">
                <div className="font-medium text-orange-800 text-xs">
                  Character Features
                </div>
                <div className="text-orange-700 text-lg font-bold">
                  {
                    tags.filter((tag) =>
                      [
                        "girl",
                        "boy",
                        "woman",
                        "man",
                        "child",
                        "elderly",
                      ].includes(tag.toLowerCase())
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!tags && processingStep !== "analyzing" && (
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
