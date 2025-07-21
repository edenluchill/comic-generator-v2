"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Trash2, Calendar, Hash, Sparkles, Heart } from "lucide-react";
import { Character } from "@/types/characters";

interface CharacterDetailModalProps {
  character: Character;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export default function CharacterDetailModal({
  character,
  onClose,
  onDelete,
}: CharacterDetailModalProps) {
  const handleDeleteCharacter = async () => {
    if (confirm("确定要删除这个角色吗？")) {
      try {
        if (onDelete) {
          await onDelete(character.id);
        }
        onClose();
      } catch (error) {
        console.error("删除角色失败:", error);
      }
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 主模态框 */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-200/50 relative">
        {/* 装饰性顶部渐变 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-100/80 via-orange-100/60 to-yellow-100/40 rounded-t-3xl -z-10"></div>

        {/* 头部区域 */}
        <div className="flex items-start justify-between mb-8 relative">
          <div className="flex items-center gap-4">
            {/* 角色头像 - 特殊样式 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white/80 relative">
                <Image
                  src={character.avatar_url}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  width={160}
                  height={160}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent"></div>
              </div>
              {/* 魔法光环 */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-3xl opacity-30 blur-lg -z-10 animate-pulse"></div>
            </div>

            {/* 角色信息 */}
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                {character.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    创建于{" "}
                    {new Date(character.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-purple-500" />
                  <span className="font-mono text-xs">
                    {character.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={handleDeleteCharacter}
                className="p-3 hover:bg-red-100 rounded-2xl transition-all duration-300 text-red-600 hover:scale-110 group"
                title="删除角色"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 头像展示区 */}
          <div className="text-center group">
            <div className="relative inline-block">
              <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                专属头像
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h4>
              <div className="relative">
                <Image
                  src={character.avatar_url}
                  alt={`${character.name} 头像`}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                {/* 图片光晕效果 */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-yellow-400/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>

          {/* 3视图展示区 */}
          <div className="text-center group">
            <div className="relative inline-block">
              <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                3D 视图
                <Heart className="w-4 h-4 text-pink-500" />
              </h4>
              <div className="relative">
                <Image
                  src={character.three_view_url}
                  alt={`${character.name} 3视图`}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                {/* 图片光晕效果 */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 提示信息卡片 */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-200/50 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-700">创作小贴士</h4>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-blue-600">角色ID：</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">
                    {character.id}
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-purple-600">
                    创作提示：
                  </span>
                  在创作故事时，您可以使用角色名字
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mx-1">
                    &quot;{character.name}&quot;
                  </span>
                  来指定这个角色的动作和对话。
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-green-600">
                    使用示例：
                  </span>
                  &quot;{character.name}开心地跑向花园&quot; 或 &quot;
                  {character.name}
                  说：&apos;今天天气真好！&apos;&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
