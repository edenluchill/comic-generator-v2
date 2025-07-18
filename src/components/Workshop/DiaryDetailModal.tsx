import { X, Calendar, BookOpen } from "lucide-react";
import {
  DiaryComic,
  DiaryWithComics,
  SimpleComicScene,
} from "@/hooks/useDiaries";
import { formatDate, getStatusColor, getStatusText } from "@/lib/diary-utils";
import Image from "next/image";

interface DiaryDetailModalProps {
  diary: DiaryWithComics;
  onClose: () => void;
}

export default function DiaryDetailModal({
  diary,
  onClose,
}: DiaryDetailModalProps) {
  const firstComic =
    diary.comics && diary.comics.length > 0 ? diary.comics[0] : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <ModalHeader title={diary.title} onClose={onClose} />

        {/* 内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：日记内容 */}
          <DiaryContent diary={diary} />

          {/* 右侧：四格漫画 */}
          <ComicSection comic={firstComic} />
        </div>

        {/* 底部信息 */}
        <DiaryMetadata diary={diary} comic={firstComic} />
      </div>
    </div>
  );
}

// 模态框头部
function ModalHeader({
  title,
  onClose,
}: {
  title?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-gray-800">
        {title || "无标题日记"}
      </h3>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

// 日记内容区域
function DiaryContent({ diary }: { diary: DiaryWithComics }) {
  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-700 mb-3">日记内容</h4>
      <div className="bg-amber-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4" />
          <span>日期: {formatDate(diary.date)}</span>
          <span
            className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              diary.status
            )}`}
          >
            {getStatusText(diary.status)}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {diary.content || "无内容"}
        </p>
      </div>
    </div>
  );
}

// 漫画区域
function ComicSection({ comic }: { comic: DiaryComic | null }) {
  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-700 mb-3">四格漫画</h4>
      {comic && comic.comic_scene && comic.comic_scene.length > 0 ? (
        <ComicGrid scenes={comic.comic_scene} />
      ) : (
        <EmptyComicState />
      )}
    </div>
  );
}

// 漫画网格
function ComicGrid({ scenes }: { scenes: SimpleComicScene[] }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className="aspect-square bg-white border-2 border-amber-200 rounded overflow-hidden"
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
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                  <p className="text-xs">场景{index + 1}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 空漫画状态
function EmptyComicState() {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>还没有生成漫画</p>
    </div>
  );
}

// 日记元数据
function DiaryMetadata({
  diary,
  comic,
}: {
  diary: DiaryWithComics;
  comic: DiaryComic | null;
}) {
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div>
          <strong>创建时间：</strong> {formatDate(diary.created_at)}
        </div>
        <div>
          <strong>日记状态：</strong> {getStatusText(diary.status)}
        </div>
        <div>
          <strong>日记ID：</strong> {diary.id}
        </div>
      </div>
      {comic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
          <div>
            <strong>漫画风格：</strong> {comic.style}
          </div>
          <div>
            <strong>漫画状态：</strong> {getStatusText(comic.status)}
          </div>
        </div>
      )}
    </div>
  );
}
