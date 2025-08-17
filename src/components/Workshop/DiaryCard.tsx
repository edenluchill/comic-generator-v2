import { DiaryWithComics } from "@/hooks/useDiaries";
import { formatDate } from "@/lib/diary-utils";
import Image from "next/image";

interface DiaryCardProps {
  diary: DiaryWithComics;
  onClick: () => void;
}

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const firstComic = diary.comics?.[0];

  return (
    <div
      className="aspect-[5/4] bg-gradient-to-br from-secondary via-accent/30 to-primary/20 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-border group overflow-hidden relative hover:scale-105"
      onClick={onClick}
    >
      {/* 装订线 - 使用主题色彩 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent"></div>

      {/* 打孔效果 - 使用主题色彩 */}
      <div className="absolute left-2 top-3 flex flex-col gap-2.5">
        {[1, 2, 3].map((hole) => (
          <div
            key={hole}
            className="w-1.5 h-1.5 bg-card rounded-full border border-primary/30 shadow-inner"
            style={{
              boxShadow: "inset 0 1px 2px oklch(0 0 0 / 0.1)",
            }}
          />
        ))}
      </div>

      {/* 笔记本横线效果 - 使用主题色彩 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 18px,
            oklch(0.5 0.05 340 / 0.5) 18px,
            oklch(0.5 0.05 340 / 0.5) 19px
          )`,
          marginTop: "32px",
          marginLeft: "18px",
          marginRight: "12px",
        }}
      />

      <div
        className="p-2 h-full flex flex-col relative"
        style={{ paddingLeft: "18px" }}
      >
        {/* 日期贴纸效果 - 使用主题色彩 */}
        <div className="absolute top-1 left-3 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-mono transform rotate-2 shadow-sm z-10 border border-primary/30">
          {formatDate(diary.date)}
        </div>

        {/* 主要内容区 */}
        <div className="flex gap-2.5 mt-2 relative z-10 flex-1 min-h-0">
          {/* 文字部分 - 使用主题色彩 */}
          <div className="flex-1 mt-4 min-w-0">
            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-5 relative">
              {diary.content}
            </p>
          </div>

          {/* 漫画部分 - 使用主题色彩 */}
          {firstComic?.comic_scene?.length > 0 && (
            <div className="w-18 flex flex-col gap-1 flex-shrink-0">
              {firstComic.comic_scene.slice(0, 2).map((scene, index) => (
                <div
                  key={scene.id}
                  className="aspect-square bg-card rounded border-2 border-card shadow-md overflow-hidden transform hover:scale-105 transition-transform group-hover:border-primary/30"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? "2deg" : "-2deg"})`,
                  }}
                >
                  {scene.image_url ? (
                    <Image
                      src={scene.image_url}
                      alt={`场景${index + 1}`}
                      className="w-full h-full object-cover"
                      width={72}
                      height={72}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded"></div>
                    </div>
                  )}
                </div>
              ))}

              {/* 更多漫画指示 - 使用主题色彩 */}
              {/* {firstComic.comic_scene.length > 2 && (
                <div className="text-center mt-1">
                  <div className="w-4 h-4 bg-accent/40 rounded-full flex items-center justify-center mx-auto border border-accent/60">
                    <span className="text-[9px] text-primary font-medium">
                      {firstComic.comic_scene.length - 2}
                    </span>
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>

        {/* 悬浮时的装饰效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

        {/* 角落装饰 - 使用主题色彩 */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-accent/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
      </div>
    </div>
  );
}
