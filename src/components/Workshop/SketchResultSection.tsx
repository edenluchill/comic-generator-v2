"use client";

import { Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";

interface SketchResultSectionProps {
  sketchResult: string | null;
  processingStep: "analyzing" | "generating" | "flux-generating" | null;
  mounted: boolean;
}

export default function SketchResultSection({
  sketchResult,
  processingStep,
  mounted,
}: SketchResultSectionProps) {
  const t = useTranslations("WorkshopPage");

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 lg:p-6 border border-amber-100/50 transition-all duration-700 delay-300 ${
        mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
        <div className="w-6 h-6 lg:w-8 lg:h-8 border-2 border-amber-400/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:border-amber-500 hover:scale-105">
          <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-amber-800">
          {t("sketchCharacter")}
        </h2>
      </div>

      {processingStep === "generating" && (
        <div className="flex flex-col items-center justify-center h-32 lg:h-40">
          <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-amber-400/50 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 animate-spin" />
          </div>
          <p className="text-sm lg:text-base text-amber-700 font-medium">
            {t("generatingSketch")}
          </p>
        </div>
      )}

      {sketchResult ? (
        <div className="space-y-3 lg:space-y-4">
          <div className="border-2 border-amber-200 rounded-xl overflow-hidden shadow-md">
            <Image
              src={sketchResult}
              alt="Generated Sketch"
              width={400}
              height={192}
              className="w-full h-40 lg:h-48 object-cover"
              unoptimized
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button className="flex-1 bg-amber-500 text-white px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-amber-600">
              {t("saveCharacter")}
            </button>
            <button className="flex-1 bg-white border border-amber-200 text-amber-700 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-amber-50">
              {t("regenerate")}
            </button>
          </div>
        </div>
      ) : (
        processingStep !== "generating" && (
          <div className="text-center text-amber-600 mt-8 lg:mt-12">
            <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-amber-400/50 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
            </div>
            <p className="font-medium text-sm lg:text-base">
              {t("clickToStartAnalysis")}
            </p>
          </div>
        )
      )}
    </div>
  );
}
