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
      className="aspect-[5/4] bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-amber-200 group overflow-hidden relative"
      onClick={onClick}
    >
      {/* 装订线 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-amber-400"></div>

      {/* 打孔效果 */}
      <div className="absolute left-2 top-3 flex flex-col gap-2.5">
        {" "}
        {/* 调整位置和间距 */}
        {[1, 2, 3].map((hole) => (
          <div
            key={hole}
            className="w-1.5 h-1.5 bg-white rounded-full border border-amber-300/30 shadow-inner"
            style={{
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>

      {/* 笔记本横线效果 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 18px,
            rgba(156, 163, 175, 0.5) 18px,
            rgba(156, 163, 175, 0.5) 19px
          )`, // 稍微增加行间距
          marginTop: "32px", // 减少顶部边距
          marginLeft: "18px",
          marginRight: "12px",
        }}
      />

      <div
        className="p-2 h-full flex flex-col relative"
        style={{ paddingLeft: "18px" }}
      >
        {/* 日期贴纸效果 */}
        <div className="absolute top-1 left-3 bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs font-mono transform rotate-2 shadow-sm z-10">
          {formatDate(diary.date)}
        </div>

        {/* 主要内容区 */}
        <div className="flex gap-2.5 mt-2 relative z-10 flex-1 min-h-0">
          {/* 文字部分 */}
          <div className="flex-1 mt-4 min-w-0">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-5 relative">
              {diary.content || "今天发生了很多有趣的事情..."}
            </p>
          </div>
          {/* 漫画部分 - 显著增大图片 */}
          {firstComic?.comic_scene?.length > 0 && (
            <div className="w-18 flex flex-col gap-1 flex-shrink-0">
              {firstComic.comic_scene.slice(0, 2).map((scene, index) => (
                <div
                  key={scene.id}
                  className="aspect-square bg-white rounded border-2 border-white shadow-md overflow-hidden transform hover:scale-105 transition-transform" // border → border-2, shadow-sm → shadow-md
                  style={{
                    transform: `rotate(${index % 2 === 0 ? "2deg" : "-2deg"})`, // 1.5deg → 2deg
                  }}
                >
                  {scene.image_url ? (
                    <Image
                      src={scene.image_url}
                      alt={`场景${index + 1}`}
                      className="w-full h-full object-cover"
                      width={72} // 56 → 72
                      height={72} // 56 → 72
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-300 rounded"></div>{" "}
                      {/* w-1.5 h-1.5 → w-2 h-2 */}
                    </div>
                  )}
                </div>
              ))}
              {/* 更多漫画指示 */}
              {firstComic.comic_scene.length > 2 && (
                <div className="text-center mt-1">
                  {" "}
                  {/* mt-0.5 → mt-1 */}
                  <div className="w-4 h-4 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
                    {" "}
                    {/* w-3.5 h-3.5 → w-4 h-4 */}
                    <span className="text-[9px] text-amber-700 font-medium">
                      {" "}
                      {/* text-[8px] → text-[9px] */}+
                      {firstComic.comic_scene.length - 2}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
