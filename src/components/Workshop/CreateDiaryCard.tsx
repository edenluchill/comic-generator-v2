import { Plus, BookOpen } from "lucide-react";

interface CreateDiaryCardProps {
  onClick: () => void;
}

export default function CreateDiaryCard({ onClick }: CreateDiaryCardProps) {
  return (
    <div
      onClick={onClick}
      className="aspect-[5/4] border-2 border-dashed border-amber-300 rounded-lg cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-25 to-yellow-25"
    >
      {/* 主要图标 */}
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors mb-3 relative">
        <BookOpen className="w-6 h-6 text-amber-600" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-300 rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors">
          <Plus className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* 文字 */}
      <div className="text-center">
        <p className="text-sm font-medium text-amber-800 mb-1">创建新日记</p>
        <p className="text-xs text-amber-600">记录今天的故事</p>
      </div>

      {/* 可爱的装饰点 */}
      <div className="absolute top-4 right-4 w-1 h-1 bg-amber-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-amber-400 rounded-full opacity-40"></div>
    </div>
  );
}
