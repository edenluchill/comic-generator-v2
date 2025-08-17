import { Plus, BookOpen } from "lucide-react";

interface CreateDiaryCardProps {
  onClick: () => void;
}

export default function CreateDiaryCard({ onClick }: CreateDiaryCardProps) {
  return (
    <div
      onClick={onClick}
      className="aspect-[5/4] border-2 border-dashed border-primary/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-secondary/50 group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-secondary/25 to-accent/25 hover:scale-105 relative overflow-hidden"
    >
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

      {/* 主要图标 - 使用主题色彩 */}
      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 mb-3 relative border border-border group-hover:border-primary/30 group-hover:scale-110 shadow-sm">
        <BookOpen className="w-6 h-6 text-primary group-hover:text-primary/80 transition-colors" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center group-hover:bg-accent transition-all duration-300 shadow-lg group-hover:scale-110">
          <Plus className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>

      {/* 文字 - 使用主题色彩 */}
      <div className="text-center relative z-10">
        <p className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
          创建新日记
        </p>
        <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
          记录今天的故事
        </p>
      </div>

      {/* 可爱的装饰点 - 使用主题色彩 */}
      <div className="absolute top-4 right-4 w-1 h-1 bg-primary/60 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-accent/60 rounded-full opacity-40 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300 delay-100"></div>

      {/* 额外的装饰元素 */}
      <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></div>
      <div className="absolute top-6 right-1/3 w-0.5 h-0.5 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300"></div>
    </div>
  );
}
