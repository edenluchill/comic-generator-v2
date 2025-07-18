"use client";

import { useState } from "react";
import { Plus, X, Eye, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

// 更新接口以接收角色数据
interface CharactersListProps {
  onAddNewCharacter: () => void;
  mounted: boolean;
  characters: Character[]; // 添加角色数据prop
  loading?: boolean; // 添加loading状态prop
  onDeleteCharacter?: (id: string) => Promise<void>; // 添加删除回调
}

// 定义Character类型（如果需要的话）
interface Character {
  id: string;
  name: string;
  avatar_url: string;
  three_view_url: string;
  created_at: string;
  user_id: string;
}

export default function CharactersList({
  onAddNewCharacter,
  mounted,
  characters,
  loading = false,
  onDeleteCharacter,
}: CharactersListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  const handleDeleteCharacter = async (characterId: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      try {
        if (onDeleteCharacter) {
          await onDeleteCharacter(characterId);
        }
        setSelectedCharacter(null);
      } catch (error) {
        console.error("删除角色失败:", error);
        // 可以在这里显示错误提示
      }
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-1000 delay-200 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            我的角色 ({characters.length}) {loading && "(加载中...)"}
          </h3>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* 现有角色 */}
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => setSelectedCharacter(character)}
            />
          ))}

          {/* 添加新角色按钮 */}
          <div
            onClick={onAddNewCharacter}
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 group"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* 角色详情模态框 - 使用 Portal 渲染到 body */}
      {selectedCharacter &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedCharacter.name}
                </h3>
                <div className="flex items-center gap-2">
                  {onDeleteCharacter && (
                    <button
                      onClick={() =>
                        handleDeleteCharacter(selectedCharacter.id)
                      }
                      className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
                      title="删除角色"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCharacter(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 头像 */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    头像
                  </h4>
                  <img
                    src={selectedCharacter.avatar_url}
                    alt={`${selectedCharacter.name} 头像`}
                    className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                  />
                </div>

                {/* 3视图 */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    3视图
                  </h4>
                  <img
                    src={selectedCharacter.three_view_url}
                    alt={`${selectedCharacter.name} 3视图`}
                    className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* 角色信息 */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  角色信息
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>创建时间：</strong>{" "}
                    {new Date(selectedCharacter.created_at).toLocaleString(
                      "zh-CN"
                    )}
                  </p>
                  <p>
                    <strong>角色ID：</strong> {selectedCharacter.id}
                  </p>
                  <p className="text-blue-600 font-medium">
                    💡 提示：在创作故事时，您可以使用角色名字 &quot;
                    {selectedCharacter.name}&quot; 来指定这个角色的动作
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function CharacterCard({
  character,
  onClick,
}: {
  character: Character;
  onClick: () => void;
}) {
  return (
    <div className="group relative cursor-pointer" onClick={onClick}>
      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 relative">
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-full h-full object-cover"
        />
        {/* 查看详情图标 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* 角色名称提示 */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {character.name}
        </div>
      </div>
    </div>
  );
}
