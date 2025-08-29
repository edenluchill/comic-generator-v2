"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useComics } from "@/hooks/useComics";
import { Comic } from "@/types/diary";

export default function WorkshopOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const { data: comicsData, isLoading, error } = useComics(1, 20);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateNewComic = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "comic");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleViewComic = (comic: Comic) => {
    // 跳转到漫画详情页面或在模态框中显示
    console.log("查看漫画:", comic);
    // 可以实现跳转到漫画详情页面
    // router.push(`/comic/${comic.id}`);
  };

  return (
    <div className="min-h-screen pb-8 bg-theme-gradient relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-2 relative z-10 max-w-6xl">
        {/* 标题 */}
        <div
          className={`mb-4 text-center transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg text-sm shadow-sm border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">创建你的专属漫画故事</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* 漫画列表 */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">我的漫画</h2>
              <button
                onClick={handleCreateNewComic}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                创建新漫画
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg p-4 border border-border animate-pulse"
                  >
                    <div className="h-40 bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">
                  加载漫画时出错: {error.message}
                </p>
              </div>
            ) : !comicsData?.comics?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  还没有漫画作品
                </h3>
                <p className="text-muted-foreground mb-4">
                  开始创作你的第一个漫画故事吧！
                </p>
                <button
                  onClick={handleCreateNewComic}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  创建漫画
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comicsData.comics.map((comic) => (
                  <div
                    key={comic.id}
                    className="bg-card rounded-lg p-4 border border-border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewComic(comic)}
                  >
                    {/* 漫画预览 */}
                    <div className="h-40 bg-muted rounded-lg mb-4 flex items-center justify-center">
                      {comic.scenes?.[0]?.image_url ? (
                        <img
                          src={comic.scenes[0].image_url}
                          alt={comic.title || "漫画"}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Sparkles className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>

                    {/* 漫画信息 */}
                    <div>
                      <h3 className="font-semibold text-primary mb-1 truncate">
                        {comic.title || "无标题"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {comic.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
