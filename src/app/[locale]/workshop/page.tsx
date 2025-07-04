// 优化 workshop 页面
"use client";

import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// 懒加载 workshop 组件
const CharacterCreationWorkshop = lazy(
  () => import("@/components/Workshop/CharacterCreationWorkshop")
);

// 加载中组件
const WorkshopSkeleton = () => (
  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <div className="animate-pulse bg-amber-200 h-8 w-64 mx-auto rounded-lg mb-4"></div>
        <div className="animate-pulse bg-amber-100 h-4 w-96 mx-auto rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/80 rounded-2xl p-6 animate-pulse">
            <div className="bg-amber-200 h-6 w-32 mb-4 rounded"></div>
            <div className="bg-amber-100 h-48 w-full rounded"></div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span className="text-amber-700">Loading Workshop...</span>
        </div>
      </div>
    </div>
  </div>
);

export default function WorkshopPage() {
  return (
    <Suspense fallback={<WorkshopSkeleton />}>
      <CharacterCreationWorkshop />
    </Suspense>
  );
}
