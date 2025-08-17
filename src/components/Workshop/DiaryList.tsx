"use client";

import { useState } from "react";
import {
  useDiaries,
  DiaryWithComics,
  useDeleteDiary,
} from "@/hooks/useDiaries";
import DiaryCard from "./DiaryCard";
import CreateDiaryCard from "./CreateDiaryCard";
import DiaryDetailModal from "./DiaryDetailModal";
import { createPortal } from "react-dom";
import { Loader } from "../ui/loading";

interface DiaryListProps {
  onCreateNewDiary: () => void;
  onViewDiary: (diary: DiaryWithComics) => void;
  mounted: boolean;
}

export default function DiaryList({
  onCreateNewDiary,
  onViewDiary,
  mounted,
}: DiaryListProps) {
  const { data: diariesData, isLoading, error } = useDiaries(1, 20);
  const deleteDiaryMutation = useDeleteDiary();
  const [selectedDiary, setSelectedDiary] = useState<DiaryWithComics | null>(
    null
  );

  const diaries = diariesData?.diaries || [];

  const handleViewDiary = (diary: DiaryWithComics) => {
    setSelectedDiary(diary);
    onViewDiary(diary);
  };

  const handleCloseModal = () => {
    setSelectedDiary(null);
  };

  const handleDeleteDiary = async (diaryId: string) => {
    try {
      await deleteDiaryMutation.mutateAsync(diaryId);
      // 删除成功提示可以在这里添加，比如 toast 通知
    } catch (error) {
      console.error("删除日记失败:", error);
      // 错误提示可以在这里添加
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-1000 delay-400 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* 标题 */}
        <DiaryListHeader count={diaries.length} isLoading={isLoading} />

        {/* 错误提示 - 使用主题色彩 */}
        {error && <ErrorMessage error={error} />}

        {/* 删除状态提示 - 使用主题色彩 */}
        {deleteDiaryMutation.isPending && (
          <div className="mb-4 p-3 bg-chart-2/10 text-chart-2 rounded-lg text-sm border border-chart-2/20">
            正在删除日记...
          </div>
        )}

        {/* 日记卡片网格 */}
        <DiaryGrid
          diaries={diaries}
          onViewDiary={handleViewDiary}
          onCreateNewDiary={onCreateNewDiary}
        />
      </div>

      {/* 日记详情模态框 - 使用 Portal */}
      {selectedDiary &&
        typeof document !== "undefined" &&
        createPortal(
          <DiaryDetailModal
            diary={selectedDiary}
            onClose={handleCloseModal}
            onDelete={handleDeleteDiary} // 添加删除回调
          />,
          document.body
        )}
    </>
  );
}

// 日记列表标题 - 使用主题色彩
function DiaryListHeader({
  count,
  isLoading,
}: {
  count: number;
  isLoading: boolean;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-foreground mb-3">
        <div className="flex items-center gap-2">
          我的日记本
          <span className="text-base font-normal bg-secondary text-primary px-2 py-1 rounded-full border border-border">
            {count}
          </span>
          {isLoading && <Loader size="sm" />}
        </div>
      </h3>
    </div>
  );
}

// 错误消息 - 使用主题色彩
function ErrorMessage({ error }: { error: Error }) {
  const errorMessage = error instanceof Error ? error.message : "未知错误";

  return (
    <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
      获取日记失败: {errorMessage}
    </div>
  );
}

// 日记网格
function DiaryGrid({
  diaries,
  onViewDiary,
  onCreateNewDiary,
}: {
  diaries: DiaryWithComics[];
  onViewDiary: (diary: DiaryWithComics) => void;
  onCreateNewDiary: () => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {/* 日记卡片 */}
      {diaries.map((diary) => (
        <DiaryCard
          key={diary.id}
          diary={diary}
          onClick={() => onViewDiary(diary)}
        />
      ))}
      {/* 创建新日记按钮 */}
      <CreateDiaryCard onClick={onCreateNewDiary} />
    </div>
  );
}
