// 优化 workshop 页面
"use client";

import { useSearchParams } from "next/navigation";
// import SimpleComicGeneration from "@/components/Workshop/SimpleComicGeneration";
import WorkshopOverview from "@/components/Workshop/WorkshopOverview";
import AuthGuard from "@/components/AuthGuard";
import ComicGeneration from "@/components/Workshop/ComicGeneration";

function WorkshopContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  // 根据模式显示不同的组件
  if (mode === "comic") {
    return <ComicGeneration />;
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
