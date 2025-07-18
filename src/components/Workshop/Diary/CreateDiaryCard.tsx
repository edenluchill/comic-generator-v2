import { Plus } from "lucide-react";

interface CreateDiaryCardProps {
  onClick: () => void;
}

export default function CreateDiaryCard({ onClick }: CreateDiaryCardProps) {
  return (
    <div
      onClick={onClick}
      className="aspect-square border-2 border-dashed border-amber-300 rounded-xl cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 group flex flex-col items-center justify-center p-4"
    >
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors mb-2">
        <Plus className="w-4 h-4 text-amber-600" />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-amber-800 mb-1">创建新日记</p>
        <p className="text-xs text-amber-600">写下今天的故事</p>
      </div>
    </div>
  );
}
