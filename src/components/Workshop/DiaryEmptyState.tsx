import { BookOpen } from "lucide-react";

export default function DiaryEmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="relative inline-block mb-4">
        <BookOpen className="w-12 h-12 mx-auto text-primary/60" />
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-full blur-lg"></div>
      </div>
      <p className="text-lg mb-2 text-foreground/80">还没有日记</p>
      <p className="text-sm text-muted-foreground">
        点击上方按钮创建你的第一篇日记
      </p>
    </div>
  );
}
