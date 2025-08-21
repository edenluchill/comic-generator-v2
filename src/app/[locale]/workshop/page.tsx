// 优化 workshop 页面
"use client";

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
    <AuthGuard>
      <WorkshopContent />
    </AuthGuard>
  );
}
