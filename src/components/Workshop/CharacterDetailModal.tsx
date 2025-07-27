"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Trash2,
  Calendar,
  Hash,
  Sparkles,
  Edit3,
  Check,
  X as XIcon,
} from "lucide-react";
import { Character } from "@/types/characters";
import { useUpdateCharacter } from "@/hooks/useCharacters";
import { useState, useEffect } from "react";

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(character.name);
  const [displayName, setDisplayName] = useState(character.name); // 新增：用于显示的名字状态
  const updateCharacter = useUpdateCharacter();

  // 当 character prop 变化时，更新本地状态
  useEffect(() => {
    setDisplayName(character.name);
    setEditedName(character.name);
  }, [character.name]);

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

  const handleSaveName = async () => {
    if (editedName.trim() === "") {
      alert("角色名字不能为空");
      return;
    }

    if (editedName.trim() === displayName) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateCharacter.mutateAsync({
        characterId: character.id,
        updateData: { name: editedName.trim() },
      });

      // 立即更新显示的名字
      setDisplayName(editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error("更新角色名字失败:", error);
      alert("更新失败，请重试");
    }
  };

  const handleCancelEdit = () => {
    setEditedName(displayName);
    setIsEditingName(false);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
      {/* 背景装饰 - 改为温暖色调 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 主模态框 */}
      <div
        className="bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-200/50 relative"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(245, 158, 11, 0.3) rgba(254, 243, 199, 0.1)",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: rgba(254, 243, 199, 0.1);
            border-radius: 10px;
          }

          div::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              rgba(245, 158, 11, 0.4),
              rgba(251, 191, 36, 0.3)
            );
            border-radius: 10px;
            border: 1px solid rgba(245, 158, 11, 0.1);
          }

          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              rgba(245, 158, 11, 0.6),
              rgba(251, 191, 36, 0.5)
            );
          }
        `}</style>

        {/* 魔法光环效果 */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 via-orange-400/10 to-yellow-400/20 rounded-3xl opacity-50 blur-xl -z-20 animate-pulse"></div>

        {/* 头部区域 */}
        <div className="flex items-start justify-between mb-8 relative">
          <div className="flex items-center gap-4">
            {/* 角色头像 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white/80 relative">
                <Image
                  src={character.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  width={160}
                  height={160}
                />
              </div>
            </div>

            {/* 角色信息 */}
            <div className="flex-1">
              {/* 可编辑的角色名字 */}
              <div className="flex items-center gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-3xl font-bold bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-amber-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200/50 transition-all duration-300 shadow-lg min-w-0 flex-1"
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        color: "#92400e",
                        fontWeight: "bold",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                      placeholder="请输入角色名字"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={updateCharacter.isPending}
                      className="p-1.5 hover:bg-green-100/70 rounded-lg transition-all duration-300 text-green-600 hover:scale-110 group backdrop-blur-sm border border-green-200/50 disabled:opacity-50"
                      title="保存"
                    >
                      <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateCharacter.isPending}
                      className="p-1.5 hover:bg-gray-100/70 rounded-lg transition-all duration-300 text-gray-600 hover:scale-110 group backdrop-blur-sm border border-gray-200/50 disabled:opacity-50"
                      title="取消"
                    >
                      <XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-700 bg-clip-text text-transparent">
                      {displayName}
                    </h3>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 hover:bg-amber-100/70 rounded-lg transition-all duration-300 text-amber-600 hover:scale-110 group backdrop-blur-sm border border-amber-200/50 opacity-0 group-hover:opacity-100"
                      title="编辑名字"
                    >
                      <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-amber-700/80">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    创建于{" "}
                    {new Date(character.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-orange-600" />
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
                className="p-3 hover:bg-red-100/70 rounded-2xl transition-all duration-300 text-red-600 hover:scale-110 group backdrop-blur-sm border border-red-200/50"
                title="删除角色"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-all duration-300 backdrop-blur-sm border border-amber-200/50"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 头像展示区 */}
          <div className="text-center flex items-center justify-center">
            <div className="relative inline-block">
              <div className="relative ">
                <Image
                  src={character.avatar_url}
                  alt={`${displayName} 头像`}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-yellow-400/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>

          {/* 3视图展示区 */}
          <div className="text-center group">
            <div className="relative inline-block">
              <div className="relative">
                <Image
                  src={character.three_view_url}
                  alt={`${displayName} 3视图`}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/30 via-yellow-400/20 to-amber-400/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 提示信息卡片 */}
        <div className="bg-gradient-to-r from-amber-50/80 via-yellow-50/60 to-orange-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-amber-800">创作小贴士</h4>
            </div>

            <div className="space-y-3 text-sm text-amber-800/80">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-amber-700">角色ID：</span>
                  <span className="font-mono bg-amber-100/50 px-2 py-1 rounded ml-2 shadow-sm">
                    {character.id}
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-orange-700">
                    创作提示：
                  </span>
                  在创作故事时，您可以使用角色名字
                  <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-1 rounded-lg mx-1 shadow-sm">
                    &quot;{displayName}&quot;
                  </span>
                  来指定这个角色的动作和对话。
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0"></div>
                <p>
                  <span className="font-semibold text-yellow-700">
                    使用示例：
                  </span>
                  &quot;{displayName}开心地跑向花园&quot; 或 &quot;
                  {displayName}
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
