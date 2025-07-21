import { Eye, Trash2 } from "lucide-react";
import { DiaryWithComics } from "@/hooks/useDiaries";
import { formatDate, getStatusColor, getStatusText } from "@/lib/diary-utils";
import Image from "next/image";
import { useState } from "react";

interface DiaryCardProps {
  diary: DiaryWithComics;
  onClick: () => void;
  onDelete?: (diaryId: string) => void;
}

export default function DiaryCard({
  diary,
  onClick,
  onDelete,
}: DiaryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const firstComic = diary.comics?.[0];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发卡片点击事件
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(diary.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className="aspect-[4/5] bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-amber-200 group overflow-hidden relative"
      onClick={onClick}
    >
      {/* 装订线 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-amber-400"></div>

      {/* 打孔效果 */}
      <div className="absolute left-2 top-8 flex flex-col gap-6">
        {[1, 2, 3, 4, 5].map((hole) => (
          <div
            key={hole}
            className="w-2 h-2 bg-white rounded-full border border-amber-300/30 shadow-inner"
            style={{
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>

      {/* 笔记本横线效果 - 在内容区域添加横线 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 22px,
            rgba(156, 163, 175, 0.5) 22px,
            rgba(156, 163, 175, 0.5) 23px
          )`,
          marginTop: "60px", // 从标题下方开始
          marginLeft: "20px", // 给打孔留出空间
          marginRight: "16px",
        }}
      />

      {/* 删除按钮 */}
      {onDelete && (
        <div className="absolute top-2 left-2 z-10">
          {!showDeleteConfirm ? (
            <button
              onClick={handleDeleteClick}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除日记"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleConfirmDelete}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                title="确认删除"
              >
                ✓
              </button>
              <button
                onClick={handleCancelDelete}
                className="w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                title="取消删除"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className="p-4 h-full flex flex-col relative"
        style={{ paddingLeft: "28px" /* 给打孔让出空间 */ }}
      >
        {/* 日期贴纸效果 */}
        <div className="absolute top-2 right-2 bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-mono transform rotate-2 shadow-sm z-10">
          {formatDate(diary.date)}
        </div>

        {/* 标题 */}
        <div className="mb-3 mt-2 relative z-10">
          <h4 className="font-medium text-gray-800 text-sm line-clamp-2 relative bg-gradient-to-r from-amber-50/80 to-transparent px-1 py-0.5 rounded">
            {diary.title || "无标题日记"}
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-transparent opacity-40"></div>
          </h4>
        </div>

        {/* 主要内容区 */}
        <div className="flex-1 flex gap-3 relative z-10">
          {/* 文字部分 */}
          <div className="flex-1">
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-6 relative">
              {diary.content || "今天发生了很多有趣的事情..."}
            </p>
          </div>

          {/* 漫画部分 - 像贴纸一样 */}
          {firstComic?.comic_scene?.length > 0 && (
            <div className="w-20 flex flex-col gap-1">
              {firstComic.comic_scene.slice(0, 2).map((scene, index) => (
                <div
                  key={scene.id}
                  className="aspect-square bg-white rounded border-2 border-white shadow-sm overflow-hidden transform hover:scale-105 transition-transform"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? "2deg" : "-2deg"})`,
                  }}
                >
                  {scene.image_url ? (
                    <Image
                      src={scene.image_url}
                      alt={`场景${index + 1}`}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    </div>
                  )}
                </div>
              ))}

              {/* 更多漫画指示 */}
              {firstComic.comic_scene.length > 2 && (
                <div className="text-center">
                  <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xs text-amber-700">
                      +{firstComic.comic_scene.length - 2}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部状态和装饰 */}
        <div className="flex items-center justify-between mt-3 relative z-10">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              diary.status
            )}`}
          >
            {getStatusText(diary.status)}
          </span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-amber-600/60 group-hover:text-amber-600 transition-colors" />
            <span className="text-xs text-amber-600/60 font-mono">
              #{diary.id.slice(-4)}
            </span>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute bottom-4 left-4 w-8 h-0.5 bg-amber-300 opacity-30 transform -rotate-12 z-10"></div>
        <div className="absolute top-1/2 right-4 w-1 h-8 bg-amber-300 opacity-20 transform rotate-45 z-10"></div>
      </div>
    </div>
  );
}
