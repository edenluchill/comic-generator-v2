"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface DiaryInputProps {
  onTextChange: (text: string) => void;
  value: string;
  disabled?: boolean;
}

export default function DiaryInput({
  onTextChange,
  value,
  disabled,
}: DiaryInputProps) {
  const t = useTranslations("WorkshopPage.ComicGeneration.DiaryInput");

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 h-full relative overflow-hidden border border-border">
      {/* 纸质背景纹理 - 使用主题色彩 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/50"></div>
      </div>

      {/* 纸张装订线 - 使用主题色彩 */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-destructive/50"></div>
      <div className="absolute left-5 top-0 bottom-0 w-0.5 h-full bg-gradient-to-b from-destructive/40 to-destructive/20"></div>

      {/* 纸张孔洞 - 使用主题色彩 */}
      <div className="absolute left-3 space-y-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-muted-foreground/30 rounded-full"
          ></div>
        ))}
      </div>

      {/* 标题区域 - 使用主题色彩 */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-4 mx-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">
            {t("storyDiary")}
          </h3>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-primary via-accent to-transparent"></div>
      </div>

      {/* 输入区域 - 使用主题色彩 */}
      <div className="relative z-10 h-full pb-16">
        <textarea
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          placeholder={t("placeholder")}
          className="w-full h-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground resize-none font-mono text-sm leading-relaxed pl-8 pr-4 py-2 disabled:opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 1.4rem, oklch(0.5 0.05 340 / 0.3) 1.4rem, oklch(0.5 0.05 340 / 0.3) calc(1.4rem + 1px))",
            lineHeight: "1.4rem",
            paddingTop: "0.2rem",
            backgroundPosition: "0 0.2rem",
          }}
        />
      </div>

      {/* 字数统计 - 使用主题色彩 */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        {value.length} {t("characterCount")}
      </div>

      {/* 装饰元素 - 使用主题色彩 */}
      <div className="absolute top-4 right-4 text-primary/20 opacity-20">
        <div className="w-8 h-8 border-2 border-current rounded-full"></div>
      </div>
    </div>
  );
}
