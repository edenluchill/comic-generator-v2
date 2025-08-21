"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { BookOpen, Sparkles, Wand2, Copy, Check, RefreshCw } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useStoryExpansion } from "@/hooks/useStoryExpansion";
import { Character } from "@/types/characters";

interface EnhancedDiaryInputProps {
  onTextChange: (text: string) => void;
  value: string;
  disabled?: boolean;
  characters: Character[];
  selectedStyle?: "cute" | "realistic" | "minimal" | "kawaii";
  comicFormat?: "single" | "four";
  onExpansionData?: (data: any) => void;
  onViewModeChange?: (mode: "original" | "expanded") => void;
  onOriginalStoryChange?: (story: string) => void;
}

export interface EnhancedDiaryInputRef {
  switchToOriginal: () => void;
  switchToExpanded: () => void;
}

const EnhancedDiaryInput = forwardRef<EnhancedDiaryInputRef, EnhancedDiaryInputProps>(({
  onTextChange,
  value,
  disabled,
  characters,
  selectedStyle = "cute",
  comicFormat = "four",
  onExpansionData,
  onViewModeChange,
  onOriginalStoryChange,
}, ref) => {
  const t = useTranslations("WorkshopPage.ComicGeneration.DiaryInput");
  const { isExpanding, expandedData, error, expandStory, reset } = useStoryExpansion();

  const [copied, setCopied] = useState(false);
  const [lastExpandedStory, setLastExpandedStory] = useState<string>("");
  const [autoUpdated, setAutoUpdated] = useState(false);
  const [viewMode, setViewMode] = useState<"original" | "expanded">("expanded");
  const [originalStory, setOriginalStory] = useState<string>("");
  const [tempExpandedStory, setTempExpandedStory] = useState<string>(""); // 临时保存AI扩展的故事

  // 重置扩展状态当输入改变时（但不包括使用扩展版本时的更新）
  useEffect(() => {
    // 如果有扩展数据，且当前值不是扩展后的故事，且不是空值，且与上次扩展的故事不同
    if (expandedData && 
        value !== expandedData.expandedStory && 
        value !== tempExpandedStory && // 也不是临时保存的扩展故事
        value.length > 0 && 
        value !== lastExpandedStory &&
        value !== originalStory) { // 也不是原始故事
      console.log("用户手动编辑了文本，重置扩展状态");
      reset();
      setTempExpandedStory(""); // 清空临时保存的扩展故事
    }
    
    // 记录当前扩展的故事
    if (expandedData?.expandedStory && expandedData.expandedStory !== lastExpandedStory) {
      setLastExpandedStory(expandedData.expandedStory);
    }
  }, [value, expandedData, tempExpandedStory, originalStory, reset, lastExpandedStory]);

  // 传递扩展数据给父组件
  useEffect(() => {
    if (onExpansionData) {
      onExpansionData(expandedData);
    }
  }, [expandedData, onExpansionData]);

  // 传递视图模式变化给父组件
  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  // 传递原始故事变化给父组件
  useEffect(() => {
    if (onOriginalStoryChange) {
      onOriginalStoryChange(originalStory);
    }
  }, [originalStory, onOriginalStoryChange]);

  const handleExpandStory = async () => {
    if (!value.trim() || characters.length === 0) return;

    try {
      // 保存原始故事
      setOriginalStory(value);
      
      const characterData = characters.map((c: Character) => ({
        id: c.id,
        name: c.name,
        avatar_url: c.avatar_url,
      }));

      const result = await expandStory({
        story: value,
        characters: characterData,
        style: selectedStyle,
        format: comicFormat,
      });
      
      // 自动更新故事文本
      if (result?.expandedStory) {
        console.log("自动使用扩展版本:", result.expandedStory.substring(0, 50) + "...");
        
        // 先设置状态，防止useEffect干扰
        setLastExpandedStory(result.expandedStory);
        setTempExpandedStory(result.expandedStory); // 保存扩展版本
        setAutoUpdated(true);
        setViewMode("expanded");
        
        // 然后更新文本
        onTextChange(result.expandedStory);
        
        // 显示更新提示几秒钟后自动隐藏
        setTimeout(() => setAutoUpdated(false), 3000);
      }
    } catch (error) {
      console.error("扩展故事失败:", error);
    }
  };

  // 提供给父组件的函数，用于切换视图模式
  const switchToOriginal = () => {
    console.log("Switching to original version");
    
    // 如果当前是扩展模式，保存当前的扩展内容
    if (viewMode === "expanded" && value) {
      setTempExpandedStory(value);
      console.log("临时保存扩展故事:", value.substring(0, 50) + "...");
    }
    
    setViewMode("original");
    
    // 切换到原始故事内容
    if (originalStory) {
      console.log("恢复原始故事:", originalStory.substring(0, 50) + "...");
      onTextChange(originalStory);
      setLastExpandedStory(originalStory);
    }
  };

  const switchToExpanded = () => {
    console.log("Switching to expanded version");
    
    // 优先使用临时保存的扩展故事，然后是API返回的扩展故事
    const expandedToUse = tempExpandedStory || expandedData?.expandedStory;
    
    if (expandedToUse) {
      setViewMode("expanded");
      console.log("恢复扩展故事:", expandedToUse.substring(0, 50) + "...");
      onTextChange(expandedToUse);
      setLastExpandedStory(expandedToUse);
    }
  };

  // 暴露函数给父组件
  useImperativeHandle(ref, () => ({
    switchToOriginal,
    switchToExpanded,
  }));

  const canExpand = value.trim().length > 0 && characters.length > 0 && !isExpanding && !disabled;

  return (
    <div className="relative h-full group">
      {/* 主容器 - 现代玻璃形态设计 */}
      <div className="h-full bg-gradient-to-br from-white/90 via-white/95 to-white/90 dark:from-gray-900/90 dark:via-gray-800/95 dark:to-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-primary/5 overflow-hidden">
        
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>
        
        {/* 顶部标题栏 */}
        <div className="relative z-10 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 现代图标容器 */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t("storyDiary")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span>使用 AI 创作更精彩的故事</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {comicFormat === "single" ? "🖼️ 海报模式" : "📚 四格漫画"}
                  </span>
                </p>
              </div>
            </div>
            
            {/* AI 扩展按钮 - 现代设计 */}
            <div className="relative group/button">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover/button:opacity-40 transition duration-1000 group-hover/button:duration-200"></div>
              <button
                onClick={handleExpandStory}
                disabled={!canExpand}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  canExpand
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="relative">
                  {isExpanding ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {canExpand && !isExpanding && (
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-50"></div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {isExpanding ? t("expanding") : t("aiExpand")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="relative z-10 h-full p-6 pt-0">
          <div className="h-full flex flex-col">
            
            {/* 文本输入区域 */}
            <div className="flex-1 relative mb-4">
              {/* 四格漫画场景显示 */}
              {expandedData && viewMode === "expanded" && comicFormat === "four" && expandedData.expandedStory?.includes("===场景分割===") ? (
                <div className="w-full h-full overflow-y-auto p-4 space-y-3">
                  {expandedData.expandedStory.split("===场景分割===").map((scene, index) => (
                    <div key={index} className="border-l-4 border-primary/40 pl-3 py-2 bg-white/30 dark:bg-gray-800/30 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          场景 {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {scene.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={value}
                  onChange={(e) => onTextChange(e.target.value)}
                  disabled={disabled}
                  placeholder={t("placeholder")}
                  className="w-full h-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground resize-none text-base leading-relaxed p-4 rounded-2xl focus-within:bg-white/50 dark:focus-within:bg-gray-800/50 transition-all duration-300"
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    lineHeight: "1.7",
                  }}
                />
              )}
              
              {/* 字数统计和工具栏 */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    {value.length} 字符
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* 现代化通知系统 */}
      {error && (
        <div className="absolute top-6 left-6 right-6 z-50">
          <div className="bg-red-50/90 dark:bg-red-950/90 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-5 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">扩展失败</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功通知 */}
      {autoUpdated && (
        <div className="absolute top-6 left-6 right-6 z-50">
          <div className="bg-green-50/90 dark:bg-green-950/90 backdrop-blur-xl border border-green-200/50 dark:border-green-800/50 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-5 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">扩展成功</p>
                <p className="text-sm text-green-600 dark:text-green-400">故事已自动扩展更新</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

EnhancedDiaryInput.displayName = "EnhancedDiaryInput";

export default EnhancedDiaryInput;