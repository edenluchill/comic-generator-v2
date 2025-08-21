"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import ComicDisplay from "./ComicDisplay";
import WorkshopHeader, { createBackAction } from "./WorkshopHeader";
import CharacterDetailModal from "./CharacterDetailModal";
import { useCharacters, useDeleteCharacter } from "@/hooks/useCharacters";
import { useComicGeneration } from "@/hooks/useComicGeneration";
import { useStoryExpansion } from "@/hooks/useStoryExpansion";
import { Character } from "@/types/characters";
import { ComicFormat, LayoutMode } from "@/types/diary";

// localStorage 键名常量
const COMIC_FORMAT_STORAGE_KEY = "comic-generator-format-preference";

// 漫画布局样式数据 - 精选三种风格
const COMIC_STYLES = [
  {
    id: "poster",
    name: "海报样式",
    nameEn: "Poster",
    description: "单幅大图海报格式",
    icon: (
      <div className="w-full h-full">
        <div className="bg-gray-400 rounded-sm w-full h-full"></div>
      </div>
    )
  },
  {
    id: "4koma",
    name: "四格漫画",
    nameEn: "4-Koma",
    description: "2x2四格网格布局",
    icon: (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
        <div className="bg-gray-400 rounded-sm"></div>
        <div className="bg-gray-400 rounded-sm"></div>
        <div className="bg-gray-400 rounded-sm"></div>
        <div className="bg-gray-400 rounded-sm"></div>
      </div>
    )
  },
  {
    id: "asymmetric",
    name: "不对称布局",
    nameEn: "Asymmetric",
    description: "创意不对称分割",
    icon: (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
        <div className="bg-gray-400 rounded-sm"></div>
        <div className="bg-gray-400 rounded-sm row-span-2"></div>
        <div className="bg-gray-400 rounded-sm"></div>
      </div>
    )
  },
  {
    id: "three-panel",
    name: "斜线分割",
    nameEn: "Diagonal",
    description: "斜线分割布局",
    icon: (
      <div className="w-full h-full relative bg-gray-400 rounded-sm">
        {/* 斜线和横线 */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 20 20">
            {/* 主斜线 */}
            <line x1="0" y1="0" x2="20" y2="20" stroke="white" strokeWidth="1" />
            {/* 右边三角形的横线 */}
            <line x1="10" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </div>
    )
  }
];

// 故事模板数据
const STORY_TEMPLATES = [
  {
    id: "city-romance",
    title: "City Romance",
    titleZh: "都市恋爱",
    description: "A modern love story in the bustling city",
    descriptionZh: "繁华都市中的现代爱情故事",
    template: "In the heart of the bustling city, two souls cross paths in the most unexpected way. As they navigate through the challenges of modern life, their connection grows stronger with each passing day...",
    icon: "🏙️💕"
  },
  {
    id: "school-romance",
    title: "School Romance", 
    titleZh: "校园恋爱",
    description: "Sweet teenage love in school setting",
    descriptionZh: "校园里的青涩恋爱故事",
    template: "The cherry blossoms are blooming as the new school year begins. In the quiet corner of the library, a chance encounter leads to stolen glances, shared notes, and the innocent beginning of first love...",
    icon: "🌸📚"
  },
  {
    id: "family-time",
    title: "Family Sweet Time",
    titleZh: "温馨家庭时光", 
    description: "Heartwarming family moments",
    descriptionZh: "温暖的家庭时光",
    template: "Sunday morning sunshine streams through the kitchen window as the family gathers for breakfast. Laughter fills the air, pancakes are flipped, and precious memories are made in the simple moments of everyday life...",
    icon: "👨‍👩‍👧‍👦🏠"
  },
  {
    id: "adventure",
    title: "Adventure Quest",
    titleZh: "冒险之旅",
    description: "Epic journey and discoveries",
    descriptionZh: "史诗般的冒险与发现",
    template: "The ancient map reveals a hidden treasure beyond the misty mountains. Armed with courage and determination, our heroes set forth on an epic quest filled with magical encounters and unexpected challenges...",
    icon: "⚔️🗺️"
  }
];

// 从 localStorage 读取格式偏好
const getStoredFormat = (): ComicFormat => {
  if (typeof window === "undefined") return "four"; // SSR 安全

  try {
    const stored = localStorage.getItem(COMIC_FORMAT_STORAGE_KEY);
    if (stored && (stored === "single" || stored === "four")) {
      return stored as ComicFormat;
    }
  } catch (error) {
    console.warn(
      "Failed to read comic format preference from localStorage:",
      error
    );
  }

  return "four"; // 默认值
};

// 保存格式偏好到 localStorage
const saveFormatPreference = (format: ComicFormat) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COMIC_FORMAT_STORAGE_KEY, format);
  } catch (error) {
    console.warn(
      "Failed to save comic format preference to localStorage:",
      error
    );
  }
};

export default function ComicGeneration() {
  const t = useTranslations("WorkshopPage.ComicGeneration");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: characters = [], isLoading } = useCharacters();
  const deleteCharacterMutation = useDeleteCharacter();
  const {
    isGenerating,
    progress,
    message,
    currentScene,
    totalScenes,
    result,
    error,
    generateComic,
    retryScene,
  } = useComicGeneration();

  const [mounted, setMounted] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<"cute" | "realistic" | "minimal" | "kawaii">(
    "cute"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedComicStyle, setSelectedComicStyle] = useState<string>("poster");

  // Handle story text changes
  const handleStoryTextChange = (text: string) => {
    setStoryText(text);
    // Reset expansion state if user manually edits the text
    if (isExpanded) {
      setIsExpanded(false);
      setOriginalStory("");
    }
  };



  const handleTemplateSelect = (template: typeof STORY_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setStoryText(template.template);
    // Reset expansion state when selecting a new template
    setIsExpanded(false);
    setOriginalStory("");
  };

  // Handle AI story expansion - based on comic style
  const handleExpandStory = async () => {
    if (!storyText.trim()) {
      alert("请先输入故事内容");
      return;
    }

    try {
      // Save original story before expansion
      setOriginalStory(storyText);
      
      const selectedCharactersList = characters.filter(char => 
        selectedCharacters.has(char.id)
      );

      // Determine story format based on selected comic style
      let storyFormat = "single";
      let panelCount = 1;
      
      switch (selectedComicStyle) {
        case "poster":
          storyFormat = "single";
          panelCount = 1;
          break;
        case "4koma":
          storyFormat = "four";
          panelCount = 4;
          break;
        case "three-panel":
          storyFormat = "three";
          panelCount = 3;
          break;
        case "asymmetric":
          storyFormat = "four";
          panelCount = 4;
          break;
        default:
          storyFormat = "single";
          panelCount = 1;
      }

      const result = await expandStory({
        story: storyText,
        characters: selectedCharactersList,
        style: selectedStyle || "cute",
        format: storyFormat as "single" | "three" | "four",
        panelCount: panelCount
      });

      // Directly update the story text with expanded result
      if (result && result.expandedStory) {
        setStoryText(result.expandedStory);
        setIsExpanded(true);
      }
    } catch (error) {
      console.error("Story expansion failed:", error);
      alert("故事扩展失败，请重试");
    }
  };

  // Handle restoring original story
  const handleRestoreOriginal = () => {
    if (originalStory) {
      setStoryText(originalStory);
      setIsExpanded(false);
    }
  };



  // 处理角色选择和文本插入
  const handleCharacterSelect = (character: Character) => {
    const characterId = character.id;
    const characterMention = `@${character.name} `;
    
    // 切换角色选中状态
    setSelectedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        // 如果已选中，取消选择并从文本中移除
        newSet.delete(characterId);
        // 直接更新story text，不通过handleStoryTextChange来避免重置expansion state
        setStoryText(prevText => 
          prevText.replace(new RegExp(`@${character.name}\\s*`, 'g'), '')
        );
      } else {
        // 如果未选中，添加选择并插入到文本中
        newSet.add(characterId);
        // 检查角色是否已经在文本中存在，避免重复添加
        setStoryText(prevText => {
          // 检查角色提及是否已存在
          const mentionExists = prevText.includes(`@${character.name}`);
          if (mentionExists) {
            return prevText; // 如果已存在，不重复添加
          }
          // 在文本末尾插入角色提及
          const insertText = prevText.length > 0 ? `${prevText} ${characterMention}` : characterMention;
          return insertText;
        });
      }
      return newSet;
    });
  };

  // 修改状态初始化 - 从 localStorage 读取上次选择
  const [comicFormat, setComicFormat] = useState<ComicFormat>(() => {
    return getStoredFormat();
  });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-2x2");

  // AI 扩展相关状态
  const [originalStory, setOriginalStory] = useState<string>("");
  
  // 角色详情模态框状态
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // 选中的角色列表（用于故事创作）
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  
  // Story expansion hook
  const { isExpanding, expandedData, expandStory } = useStoryExpansion();
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // 组件挂载后，确保状态与 localStorage 同步
    setComicFormat(getStoredFormat());
  }, []);

  // 处理格式变更的函数
  const handleFormatChange = (newFormat: ComicFormat) => {
    setComicFormat(newFormat);
    saveFormatPreference(newFormat);
  };

  const handleBackToWorkshop = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("mode");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleAddNewCharacter = () => {
    // 切换到角色创建模式
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("mode", "character");
    router.push(`/workshop?${newSearchParams.toString()}`);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacterMutation.mutateAsync(id);
      // 如果删除的是当前选中的角色，关闭模态框
      if (selectedCharacter?.id === id) {
        setSelectedCharacter(null);
      }
      // 从选中列表中移除删除的角色
      setSelectedCharacters(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      // 从故事文本中移除对应的角色提及
      const deletedCharacter = characters.find(c => c.id === id);
      if (deletedCharacter) {
        setStoryText(prevText => 
          prevText.replace(new RegExp(`@${deletedCharacter.name}\\s*`, 'g'), '')
        );
      }
      // 可以在这里添加成功提示
    } catch (error) {
      console.error(t("deleteCharacterFailed"), error);
      // 可以在这里添加错误提示
    }
  };

  const handleGenerateComic = async () => {
    if (!storyText.trim() || characters.length === 0) return;

    try {
      const characterData = characters.map((c: Character) => ({
        id: c.id,
        name: c.name,
        avatar_url: c.avatar_url,
      }));
      await generateComic({
        diary_content: storyText,
        characters: characterData,
        style: selectedStyle,
        format: comicFormat, // 只传format，不传layout_mode
      });
    } catch (error) {
      console.error(t("generateComicFailed"), error);
    }
  };

  const handleRetryScene = async (sceneId: string, newDescription: string) => {
    try {
      await retryScene(sceneId, newDescription);
    } catch (error) {
      console.error(t("retrySceneFailed"), error);
      // 可以在这里添加错误提示
    }
  };

  const canGenerate =
    storyText.trim().length > 0 && characters.length > 0 && !isGenerating;

  // Header配置
  const backAction = createBackAction(
    ArrowLeft,
    t("backToWorkshop"),
    t("workshop"),
    handleBackToWorkshop
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
      {/* 现代化动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/2 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.05)_1px,transparent_0)] [background-size:40px_40px] opacity-20"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-7xl">
        {/* 现代化Header */}
        <WorkshopHeader
          leftAction={backAction}
          title={t("createComicWithCharacters")}
          mounted={mounted}
        />

        {/* 错误提示 - 现代化 */}
        {deleteCharacterMutation.error && (
          <div className="mb-6 flex justify-center">
            <div className="bg-red-50/90 dark:bg-red-950/90 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-5 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm">❌</span>
                </div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  {deleteCharacterMutation.error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 - 左窄右宽分栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-h-0">
          {/* 左列：控制面板 - 紧凑设计 */}
          <div className={`space-y-3 transition-all duration-1000 delay-300 flex flex-col ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            
            {/* 角色选择区域 - 超紧凑设计 */}
            <div className="relative">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-lg border border-border/50 shadow-md overflow-hidden">
                {/* 极简头部 */}
                <div className="px-3 py-1.5 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      角色选择
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {selectedCharacters.size}/{characters.length}
                    </div>
                  </div>
                </div>

                {/* 角色展示区域 - 紧凑 */}
                <div className="p-1.5">
                  {characters.length === 0 ? (
                    /* 空状态 */
                    <div className="text-center py-3">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-muted/50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">还没有角色</p>
                      <button
                        onClick={handleAddNewCharacter}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        创建角色
                      </button>
                    </div>
                  ) : (
                    /* 角色网格 */
                    <div className="space-y-1">
                      {/* 角色列表 - 水平滚动 */}
                      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                        {characters.map((character) => (
                          <div
                            key={character.id}
                            className="group relative flex-shrink-0 cursor-pointer"
                            onClick={() => handleCharacterSelect(character)}
                          >
                            {/* 角色头像 - 更小 */}
                            <div className={`relative w-10 h-10 rounded-md overflow-hidden border-2 transition-colors ${
                              selectedCharacters.has(character.id)
                                ? 'border-primary/80 shadow-md shadow-primary/25'
                                : 'border-border/60 hover:border-primary/60'
                            }`}>
                              <img
                                src={character.avatar_url}
                                alt={character.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              
                              {/* 选中状态指示器 */}
                              {selectedCharacters.has(character.id) && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* 查看详情按钮 - 更小 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCharacter(character);
                                }}
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-sm"
                                title="查看详情"
                              >
                                <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </div>

                            {/* 角色名称 - 更紧凑 */}
                            <div className="mt-0.5 text-center">
                              <p className={`text-xs font-medium truncate w-10 transition-colors ${
                                selectedCharacters.has(character.id) 
                                  ? 'text-primary font-semibold' 
                                  : 'text-foreground'
                              }`} title={character.name}>
                                {character.name}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* 添加角色按钮 - 更小 */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={handleAddNewCharacter}
                            className="group w-10 h-10 rounded-md border-2 border-dashed border-border/60 hover:border-primary/60 transition-colors flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <div className="mt-0.5 text-center">
                            <p className="text-xs text-muted-foreground">添加</p>
                          </div>
                        </div>
                      </div>

                      {/* 快速操作 */}
                      {selectedCharacters.size > 0 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 rounded-lg px-2 py-1">
                          <span>已选择 {selectedCharacters.size} 个角色</span>
                          <button
                            onClick={() => setSelectedCharacters(new Set())}
                            className="text-red-600 hover:text-red-700 transition-colors font-medium"
                          >
                            清除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 故事模板区域 - 超紧凑设计 */}
            <div className="relative">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-lg border border-border/50 shadow-md overflow-hidden">
                {/* 极简头部 */}
                <div className="px-3 py-1.5 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      故事模板
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {selectedTemplate ? '已选择' : '请选择'}
                    </div>
                  </div>
                </div>

                {/* 模板选择器 - 超紧凑水平滚动 */}
                <div className="p-1.5">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {STORY_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`group relative flex-shrink-0 w-12 h-12 rounded-md transition-all duration-200 ${
                          selectedTemplate === template.id
                            ? 'bg-primary/15 border-2 border-primary/40 shadow-sm'
                            : 'bg-muted/40 border border-border/60 hover:bg-muted/60 hover:border-primary/30'
                        }`}
                      >
                        {/* 图标 - 更小 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                          <div className={`text-xs transition-transform duration-200 ${
                            selectedTemplate === template.id ? 'scale-110' : 'group-hover:scale-105'
                          }`}>
                            {template.icon}
                          </div>
                          <div className={`text-xs font-medium mt-0.5 text-center leading-tight transition-colors ${
                            selectedTemplate === template.id 
                              ? 'text-primary' 
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            {template.titleZh.slice(0, 2)}
                          </div>
                        </div>

                        {/* 选中指示器 - 更小 */}
                        {selectedTemplate === template.id && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-1 h-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        {/* 悬浮效果 */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 选中模板信息 */}
                {selectedTemplate && (
                  <div className="px-3 pb-2">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                      <div className="text-xs text-primary/80 leading-relaxed">
                        {STORY_TEMPLATES.find(t => t.id === selectedTemplate)?.descriptionZh}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 漫画布局选择 - 超紧凑设计 */}
            <div className="relative">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-lg border border-border/50 shadow-md overflow-hidden">
                {/* 极简头部 */}
                <div className="px-3 py-1.5 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      布局样式
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {COMIC_STYLES.find(s => s.id === selectedComicStyle)?.name || 'Select'}
                    </div>
                  </div>
                </div>

                {/* 超紧凑样式选择器 */}
                <div className="p-1.5">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {COMIC_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedComicStyle(style.id)}
                        className={`group relative flex-shrink-0 w-10 h-10 rounded-md transition-all duration-200 ${
                          selectedComicStyle === style.id
                            ? 'bg-primary/15 border-2 border-primary/50'
                            : 'bg-muted/30 border border-border/60 hover:bg-muted/50 hover:border-primary/30'
                        }`}
                      >
                        {/* 样式图标 - 更小间距 */}
                        <div className="absolute inset-1">
                          {style.icon}
                        </div>

                        {/* 选中指示器 - 更小 */}
                        {selectedComicStyle === style.id && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-1 h-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 故事编辑区域 - 超紧凑编辑器 */}
            <div className="relative flex-1 min-h-0">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-lg border border-border/50 shadow-md overflow-hidden h-full flex flex-col">
                {/* 极简头部 */}
                <div className="px-3 py-1.5 border-b border-border/30 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      故事编辑
                    </h3>
                  </div>
                </div>

                {/* 紧凑文本编辑器 */}
                <div className="flex-1 p-2 min-h-0 overflow-hidden">
                  <textarea
              value={storyText}
                    onChange={(e) => handleStoryTextChange(e.target.value)}
              disabled={isGenerating}
                    placeholder="开始编写你的故事..."
                    className="w-full h-full resize-none border-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm leading-relaxed"
                    style={{ minHeight: '200px' }}
                  />
                </div>

                {/* AI 扩展按钮区域 - 紧凑 */}
                <div className="flex-shrink-0 px-3 py-2 border-t-2 border-primary bg-primary/10 min-h-[60px] flex items-center justify-center">
                  <div className="w-full flex justify-center gap-2">
                    {!isExpanded ? (
                      <button 
                        className={`px-4 py-2 rounded-md font-medium text-xs transition-colors shadow-md flex items-center gap-1.5 ${
                          isExpanding 
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                        onClick={handleExpandStory}
                        disabled={isExpanding || !storyText.trim()}
                      >
                        {isExpanding ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            AI 扩展中...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI 扩展故事 ({
                              selectedComicStyle === "poster" ? "1段" :
                              selectedComicStyle === "4koma" ? "4段" :
                              selectedComicStyle === "three-panel" ? "3段" :
                              selectedComicStyle === "asymmetric" ? "4段" : "1段"
                            })
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        {/* 扩展状态指示 - 更小 */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已扩展故事
                        </div>
                        
                        {/* 恢复原版按钮 - 更小 */}
                        <button 
                          className="px-4 py-2 rounded-md font-medium text-xs transition-colors shadow-md flex items-center gap-1.5 bg-gray-600 text-white hover:bg-gray-700"
                          onClick={handleRestoreOriginal}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          恢复原版
                        </button>
                      </>
                    )}
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          {/* 右列：漫画显示 */}
          <div className={`transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <ComicDisplay
              isGenerating={isGenerating}
              onGenerate={handleGenerateComic}
              canGenerate={canGenerate}
              progress={progress}
              progressMessage={message}
              currentScene={currentScene}
              totalScenes={totalScenes}
              scenes={result?.scenes}
              error={error}
              onRetryScene={handleRetryScene}
              format={comicFormat}
              onFormatChange={handleFormatChange}
              layoutMode={layoutMode}
              onLayoutModeChange={setLayoutMode}
              selectedComicStyle={selectedComicStyle}
            />
          </div>
        </div>



        {/* 提示信息 - 现代化 */}
        {characters.length === 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-blue-50/90 dark:bg-blue-950/90 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {t("createCharactersFirstTip")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 角色详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onDelete={handleDeleteCharacter}
        />
      )}
    </div>
  );
}
