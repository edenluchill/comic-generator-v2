import { BookOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p className="text-lg mb-2">还没有日记</p>
      <p className="text-sm">点击上方按钮创建你的第一篇日记</p>
    </div>
  );
}
