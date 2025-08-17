"use client";

import { useState } from "react";
import { Eye, X, Save, Check } from "lucide-react";
import { FluxGenerationResult } from "@/types/flux";
import Image from "next/image";
import { ProgressSpinner } from "../ui/loading";

interface AvatarDisplaySectionProps {
  currentStep: number;
  isProcessing: boolean;
  progress: number;
  status: string;
  avatarResult: FluxGenerationResult | null;
  threeViewResult: FluxGenerationResult | null;
  onSaveCharacter?: (name: string) => void;
  isSaved?: boolean;
}

export default function AvatarDisplaySection({
  currentStep,
  isProcessing,
  progress,
  status,
  avatarResult,
  threeViewResult,
  onSaveCharacter,
  isSaved = false,
}: AvatarDisplaySectionProps) {
  const [showThreeViewModal, setShowThreeViewModal] = useState(false);
  const [characterName, setCharacterName] = useState("");

  const handleSaveCharacter = () => {
    if (characterName.trim() && onSaveCharacter) {
      onSaveCharacter(characterName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveCharacter();
    } else if (e.key === "Escape") {
      setCharacterName("");
    }
  };

  const renderContent = () => {
    if (currentStep < 2 && isProcessing) {
      return (
        <ProgressSpinner
          progress={progress}
          message={status}
          color="secondary"
          size="lg"
          showProgressBar={true}
          showPercentage={true}
        />
      );
    }

    if (currentStep === 2 && isProcessing) {
      return (
        <ProgressSpinner
          progress={progress}
          message={status}
          size="lg"
          showProgressBar={true}
          showPercentage={true}
        />
      );
    }

    if (avatarResult) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <Image
            src={avatarResult.imageUrl || ""}
            alt="卡通头像"
            className="object-cover rounded-lg shadow-lg"
            width={300}
            height={300}
            unoptimized
          />

          {/* 角色生成完成状态 - 使用主题色彩 */}
          <div className="flex items-center gap-2">
            <p className="text-xs text-chart-3">✓ 头像生成完成</p>
            {threeViewResult && (
              <span className="text-xs text-primary">
                • 点击右上角查看3视图
              </span>
            )}
          </div>

          {/* 名字编辑和保存区域 - 使用主题色彩 */}
          {avatarResult && threeViewResult && !isSaved && (
            <div className="w-full max-w-sm space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  给角色起个名字
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="输入角色名字"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-foreground placeholder-muted-foreground"
                  />
                  <button
                    onClick={handleSaveCharacter}
                    disabled={!characterName.trim()}
                    className="px-4 py-2 btn-theme-primary disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                    title="保存角色"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 已保存状态 - 使用主题色彩 */}
          {isSaved && (
            <div className="flex items-center gap-2 text-chart-3 bg-chart-3/10 px-3 py-2 rounded-lg border border-chart-3/20">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">角色已保存到列表</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl flex flex-col relative border border-border">
        {/* 3视图浮动按钮 - 使用主题色彩 */}
        {threeViewResult && (
          <button
            onClick={() => setShowThreeViewModal(true)}
            className="absolute top-4 right-4 bg-primary hover:bg-primary/80 text-primary-foreground p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
            title="查看3视图"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 relative p-6">{renderContent()}</div>
      </div>

      {/* 3视图模态框 - 使用主题色彩 */}
      {showThreeViewModal && threeViewResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">角色3视图</h3>
              <button
                onClick={() => setShowThreeViewModal(false)}
                className="p-2 hover:bg-muted/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-center">
              <Image
                src={threeViewResult.imageUrl || ""}
                alt="角色3视图"
                className="max-w-full h-auto rounded-lg shadow-lg"
                width={600}
                height={400}
                unoptimized
              />
              <p className="text-sm text-muted-foreground mt-2">
                这个3视图可用于生成不同动作的漫画角色
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
