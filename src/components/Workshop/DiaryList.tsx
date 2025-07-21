"use client";

import { useState } from "react";
import {
  useDiaries,
  DiaryWithComics,
  useDeleteDiary,
} from "@/hooks/useDiaries";
import DiaryCard from "./DiaryCard";
import CreateDiaryCard from "./CreateDiaryCard";
import DiaryEmptyState from "./DiaryEmptyState";
import DiaryDetailModal from "./DiaryDetailModal";
import { createPortal } from "react-dom";

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

        {/* 错误提示 */}
        {error && <ErrorMessage error={error} />}

        {/* 删除状态提示 */}
        {deleteDiaryMutation.isPending && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            正在删除日记...
          </div>
        )}

        {/* 日记卡片网格 */}
        <DiaryGrid
          diaries={diaries}
          onViewDiary={handleViewDiary}
          onCreateNewDiary={onCreateNewDiary}
          onDeleteDiary={handleDeleteDiary}
          isDeleting={deleteDiaryMutation.isPending}
        />

        {/* 空状态 */}
        {!isLoading && diaries.length === 0 && <DiaryEmptyState />}
      </div>

      {/* 日记详情模态框 - 使用 Portal */}
      {selectedDiary &&
        typeof document !== "undefined" &&
        createPortal(
          <DiaryDetailModal diary={selectedDiary} onClose={handleCloseModal} />,
          document.body
        )}
    </>
  );
}

// 日记列表标题
function DiaryListHeader({
  count,
  isLoading,
}: {
  count: number;
  isLoading: boolean;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-amber-800 mb-3">
        我的日记本 ({count}) {isLoading && "(加载中...)"}
      </h3>
    </div>
  );
}

// 错误消息
function ErrorMessage({ error }: { error: Error }) {
  const errorMessage = error instanceof Error ? error.message : "未知错误";

  return (
    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
      获取日记失败: {errorMessage}
    </div>
  );
}

// 日记网格
function DiaryGrid({
  diaries,
  onViewDiary,
  onCreateNewDiary,
  onDeleteDiary,
  isDeleting,
}: {
  diaries: DiaryWithComics[];
  onViewDiary: (diary: DiaryWithComics) => void;
  onCreateNewDiary: () => void;
  onDeleteDiary: (diaryId: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* 日记卡片 */}
      {diaries.map((diary) => (
        <DiaryCard
          key={diary.id}
          diary={diary}
          onClick={() => onViewDiary(diary)}
          onDelete={!isDeleting ? onDeleteDiary : undefined}
        />
      ))}

      {/* 创建新日记按钮 */}
      <CreateDiaryCard onClick={onCreateNewDiary} />
    </div>
  );
}
