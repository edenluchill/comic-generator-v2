import { Calendar, Eye, BookOpen } from "lucide-react";
import {
  DiaryComic,
  DiaryWithComics,
  SimpleComicScene,
} from "@/hooks/useDiaries";
import { formatDate, getStatusColor, getStatusText } from "@/lib/diary-utils";
import Image from "next/image";
interface DiaryCardProps {
  diary: DiaryWithComics;
  onClick: () => void;
}

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const firstComic =
    diary.comics && diary.comics.length > 0 ? diary.comics[0] : null;

  return (
    <div
      className="aspect-square bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-100 hover:border-amber-200 group overflow-hidden"
      onClick={onClick}
    >
      <div className="p-3 h-full flex flex-col">
        {/* 头部状态和眼睛图标 */}
        <div className="flex items-center justify-between mb-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              diary.status
            )}`}
          >
            {getStatusText(diary.status)}
          </div>
          <Eye className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
        </div>

        {/* 日记标题 */}
        <h4 className="font-medium text-gray-800 text-sm mb-2 group-hover:text-amber-800 transition-colors line-clamp-2">
          {diary.title || "无标题日记"}
        </h4>

        {/* 漫画缩略图 */}
        <ComicThumbnail comic={firstComic} />

        {/* 日期 */}
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDate(diary.date)}</span>
        </div>
      </div>
    </div>
  );
}

// 漫画缩略图组件
function ComicThumbnail({ comic }: { comic: DiaryComic | null }) {
  if (!comic || !comic.comic_scene || comic.comic_scene.length === 0) {
    return (
      <div className="flex-1 mb-2 bg-gray-100 rounded flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 mb-2">
      <div className="grid grid-cols-2 gap-1 h-full">
        {comic.comic_scene
          .slice(0, 4)
          .map((scene: SimpleComicScene, index: number) => (
            <div
              key={scene.id}
              className="bg-gray-100 rounded border border-gray-200 overflow-hidden"
            >
              {scene.image_url ? (
                <Image
                  src={scene.image_url}
                  alt={`场景${index + 1}`}
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
