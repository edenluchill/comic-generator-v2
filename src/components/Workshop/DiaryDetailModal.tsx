import {
  X,
  Calendar,
  BookOpen,
  Sparkles,
  Heart,
  Edit3,
  Check,
  X as XIcon,
  Trash2,
} from "lucide-react";
import {
  DiaryComic,
  DiaryWithComics,
  SimpleComicScene,
  useUpdateDiary,
  useDeleteDiary,
} from "@/hooks/useDiaries";
import { formatDate, getStatusColor, getStatusText } from "@/lib/diary-utils";
import Image from "next/image";
import { useState, useEffect } from "react";

interface DiaryDetailModalProps {
  diary: DiaryWithComics;
  onClose: () => void;
  onDelete?: (diaryId: string) => void;
}

export default function DiaryDetailModal({
  diary,
  onClose,
  onDelete,
}: DiaryDetailModalProps) {
  const firstComic =
    diary.comics && diary.comics.length > 0 ? diary.comics[0] : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      {/* 主对话框 - 使用主题色彩 */}
      <div
        className="bg-card/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-border relative"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor:
            "oklch(0.65 0.15 340 / 0.3) oklch(0.96 0.03 340 / 0.1)",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: oklch(0.96 0.03 340 / 0.1);
            border-radius: 10px;
          }

          div::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              oklch(0.65 0.15 340 / 0.4),
              oklch(0.7 0.12 320 / 0.3)
            );
            border-radius: 10px;
            border: 1px solid oklch(0.65 0.15 340 / 0.1);
          }

          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              oklch(0.65 0.15 340 / 0.6),
              oklch(0.7 0.12 320 / 0.5)
            );
          }
        `}</style>
        {/* 魔法光环效果 - 使用主题色彩 */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl opacity-50 blur-xl -z-20 animate-pulse"></div>

        {/* 头部 */}
        <ModalHeader diary={diary} onClose={onClose} onDelete={onDelete} />

        {/* 内容区域 - 响应式网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <DiaryContent diary={diary} />
          <ComicSection comic={firstComic} />
        </div>

        {/* 底部信息 */}
        <DiaryMetadata diary={diary} comic={firstComic} />
      </div>
    </div>
  );
}

// 模态框头部 - 使用主题色彩
function ModalHeader({
  diary,
  onClose,
  onDelete,
}: {
  diary: DiaryWithComics;
  onClose: () => void;
  onDelete?: (diaryId: string) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(diary.title || "");
  const [displayTitle, setDisplayTitle] = useState(diary.title || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateDiary = useUpdateDiary();
  const deleteDiary = useDeleteDiary();

  // 当 diary.title 变化时，更新本地状态
  useEffect(() => {
    const title = diary.title || "";
    setDisplayTitle(title);
    setEditedTitle(title);
  }, [diary.title]);

  const handleSaveTitle = async () => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle === displayTitle) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateDiary.mutateAsync({
        diaryId: diary.id,
        updateData: { title: trimmedTitle || undefined },
      });

      // 立即更新显示的标题
      setDisplayTitle(trimmedTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("更新日记标题失败:", error);
      alert("更新失败，请重试");
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(displayTitle);
    setIsEditingTitle(false);
  };

  // 删除相关处理函数
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDiary.mutateAsync(diary.id);
      onDelete?.(diary.id);
      onClose(); // 删除后关闭模态框
    } catch (error) {
      console.error("删除日记失败:", error);
      alert("删除失败，请重试");
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex items-center justify-between relative mb-4">
      <div className="flex items-center gap-3 flex-1">
        <Sparkles className="w-6 h-6 text-primary shrink-0" />

        {/* 可编辑的标题 */}
        <div className="flex items-center gap-2 flex-1 group">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-3xl font-bold bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-lg min-w-0 flex-1 text-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                autoFocus
                placeholder="请输入日记标题"
              />
              <button
                onClick={handleSaveTitle}
                disabled={updateDiary.isPending}
                className="p-1.5 hover:bg-chart-3/10 rounded-lg transition-all duration-300 text-chart-3 hover:scale-110 group backdrop-blur-sm border border-chart-3/20 disabled:opacity-50 shrink-0"
                title="保存"
              >
                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updateDiary.isPending}
                className="p-1.5 hover:bg-muted/50 rounded-lg transition-all duration-300 text-muted-foreground hover:scale-110 group backdrop-blur-sm border border-border disabled:opacity-50 shrink-0"
                title="取消"
              >
                <XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                {displayTitle || "无标题日记"}
              </h3>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-300 text-primary hover:scale-110 group backdrop-blur-sm border border-primary/20 opacity-0 group-hover:opacity-100 shrink-0"
                title="编辑标题"
              >
                <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 右侧按钮区域 */}
      <div className="flex items-center gap-2">
        {/* 删除按钮 */}
        {onDelete && (
          <div className="flex items-center gap-1">
            {!showDeleteConfirm ? (
              <button
                onClick={handleDeleteClick}
                disabled={deleteDiary.isPending}
                className="p-2 hover:bg-destructive/10 rounded-full transition-all duration-300 text-destructive hover:scale-110 group backdrop-blur-sm border border-destructive/20 disabled:opacity-50"
                title="删除日记"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteDiary.isPending}
                  className="px-3 py-1.5 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full text-xs font-medium transition-all duration-300 disabled:opacity-50"
                  title="确认删除"
                >
                  {deleteDiary.isPending ? "删除中..." : "确认删除"}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteDiary.isPending}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full text-xs font-medium transition-all duration-300 disabled:opacity-50"
                  title="取消"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-border shrink-0"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// 日记内容区域 - 使用主题色彩
function DiaryContent({ diary }: { diary: DiaryWithComics }) {
  return (
    <div className="relative">
      {/* 日记本样式的内容区域 */}
      <div className="h-full bg-gradient-to-br from-secondary via-accent/30 to-primary/20 rounded-2xl p-8 shadow-lg border-2 border-border relative overflow-hidden">
        {/* 纸质背景纹理 */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/50"></div>
        </div>

        {/* 纸张装订线 */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-destructive/50"></div>
        <div className="absolute left-5 top-0 bottom-0 w-0.5 h-full bg-gradient-to-b from-destructive/40 to-destructive/20"></div>

        {/* 纸张孔洞 */}
        <div className="absolute left-3 top-8 space-y-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground/50 rounded-full shadow-inner"
            ></div>
          ))}
        </div>

        {/* 横线纸张效果 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 1.4rem, oklch(0.5 0.05 340) 1.4rem, oklch(0.5 0.05 340) calc(1.4rem + 1px))",
          }}
        ></div>

        <div className="relative z-10 pl-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-mono">日期: {formatDate(diary.date)}</span>
            <span
              className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                diary.status
              )} shadow-sm`}
            >
              {getStatusText(diary.status)}
            </span>
          </div>
          <p
            className="text-foreground leading-relaxed whitespace-pre-wrap text-base font-mono"
            style={{ lineHeight: "1.4rem" }}
          >
            {diary.content || "无内容"}
          </p>
        </div>
      </div>
    </div>
  );
}

// 漫画区域 - 照片风格
function ComicSection({ comic }: { comic: DiaryComic | null }) {
  return (
    <div className="relative">
      {comic && comic.comic_scene && comic.comic_scene.length > 0 ? (
        <PhotoStyleComicGrid scenes={comic.comic_scene} />
      ) : (
        <EmptyComicState />
      )}
    </div>
  );
}

// 重写 PhotoStyleComicGrid 以支持响应式和海报模式
function PhotoStyleComicGrid({ scenes }: { scenes: SimpleComicScene[] }) {
  // 按 scene_order 排序场景
  const sortedScenes = [...scenes].sort(
    (a, b) => a.scene_order - b.scene_order
  );

  // 判断是否为海报模式（只有一个场景）
  const isPosterMode = sortedScenes.length === 1;

  if (isPosterMode) {
    // 海报模式：单个大图居中显示
    return (
      <div className="bg-gradient-to-br from-secondary/50 via-accent/30 to-primary/20 rounded-2xl p-4 sm:p-8 relative shadow-lg border border-border">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/30 to-transparent rounded-2xl"></div>

        {/* 海报居中显示 */}
        <div className="relative w-full flex items-center justify-center">
          <PosterCard scene={sortedScenes[0]} />
        </div>
      </div>
    );
  }

  // 多场景模式：网格布局
  return (
    <div className="bg-gradient-to-br from-secondary/50 via-accent/30 to-primary/20 rounded-2xl p-4 sm:p-8 min-h-[300px] sm:min-h-[500px] relative shadow-lg border border-border">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/30 to-transparent rounded-2xl"></div>

      {/* 响应式照片网格 */}
      <div className="relative w-full h-full">
        <div className="block">
          <div className="grid grid-cols-2 gap-4">
            {sortedScenes.map((scene, index) => (
              <MobilePhotoCard key={scene.id} scene={scene} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 海报卡片组件
function PosterCard({ scene }: { scene: SimpleComicScene }) {
  return (
    <div className="transform transition-all duration-300 hover:scale-105 relative max-w-md w-full">
      <div className="relative bg-card rounded-xl shadow-2xl border-4 border-card overflow-hidden">
        {/* 胶带效果 - 顶部 */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-chart-1/80 rounded-sm shadow-lg border border-chart-1/60 z-10 rotate-1"></div>

        {scene.image_url ? (
          <div className="relative">
            <Image
              src={scene.image_url}
              alt="海报回忆"
              className="w-full h-auto object-cover"
              width={512}
              height={384}
              style={{ aspectRatio: "4/3" }}
            />

            {/* 图片上的光泽效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-card/10 via-transparent to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">海报生成中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 底部阴影 */}
      <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/20 blur-md rounded-full"></div>
    </div>
  );
}

// 移动端照片卡片
function MobilePhotoCard({
  scene,
  index,
}: {
  scene: SimpleComicScene;
  index: number;
}) {
  const rotations = ["rotate-1", "-rotate-1", "rotate-0.5", "-rotate-0.5"];
  const rotation = rotations[index % rotations.length];

  return (
    <div
      className={`${rotation} transform transition-all duration-300 hover:scale-105 hover:z-10 relative`}
    >
      <div className="relative aspect-square bg-card rounded-lg shadow-lg border-2 border-card overflow-hidden">
        {/* 胶带效果 */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-chart-1/70 rounded-sm shadow-sm border border-chart-1/50 z-10"></div>

        {scene.image_url ? (
          <Image
            src={scene.image_url}
            alt={`回忆片段 ${index + 1}`}
            className="w-full h-full object-cover"
            width={200}
            height={200}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <div className="w-8 h-8 bg-muted-foreground/30 rounded mx-auto mb-2"></div>
              <p className="text-xs">场景{index + 1}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 空漫画状态 - 使用主题色彩
function EmptyComicState() {
  return (
    <div className="bg-gradient-to-br from-muted/50 via-secondary/30 to-accent/20 rounded-2xl p-12 text-center border-2 border-dashed border-primary/30 shadow-inner">
      <div className="relative">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary/60" />
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-full blur-xl"></div>
      </div>
      <p className="text-primary/70 font-medium">还没有生成漫画回忆</p>
      <p className="text-muted-foreground text-sm mt-1">
        快去创造美好的回忆吧~
      </p>
    </div>
  );
}

// 日记元数据 - 使用主题色彩
function DiaryMetadata({
  diary,
  comic,
}: {
  diary: DiaryWithComics;
  comic: DiaryComic | null;
}) {
  return (
    <div className="mt-8 bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <strong className="text-foreground">创建时间：</strong>
          <span className="font-mono">{formatDate(diary.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <strong className="text-foreground">日记状态：</strong>{" "}
          {getStatusText(diary.status)}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
          <strong className="text-foreground">日记ID：</strong>
          <span className="font-mono">#{diary.id.slice(-8)}</span>
        </div>
      </div>
      {comic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-chart-2" />
            <strong className="text-foreground">漫画风格：</strong>{" "}
            {comic.style}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3 text-chart-3" />
            <strong className="text-foreground">漫画状态：</strong>{" "}
            {getStatusText(comic.status)}
          </div>
        </div>
      )}
    </div>
  );
}
