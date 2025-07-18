// 优化 workshop 页面
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CharacterCreationWorkshop from "@/components/Workshop/CharacterCreationWorkshop";
import ComicGeneration from "@/components/Workshop/ComicGeneration";
import WorkshopOverview from "@/components/Workshop/WorkshopOverview";
import AuthGuard from "@/components/AuthGuard";

function WorkshopContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  // 根据模式显示不同的组件
  if (mode === "comic") {
    return <ComicGeneration />;
  }

  if (mode === "character") {
    return <CharacterCreationWorkshop />;
  }

  // 默认显示概览页面
  return <WorkshopOverview />;
}

export default function WorkshopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
          <div className="text-amber-700">加载中...</div>
        </div>
      }
    >
      <AuthGuard>
        <WorkshopContent />
      </AuthGuard>
    </Suspense>
  );
}
