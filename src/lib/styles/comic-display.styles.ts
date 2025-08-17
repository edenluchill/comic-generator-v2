import { ComicFormat, LayoutMode } from "@/types/diary";
import { Square, Grid2X2 } from "lucide-react";

// 格式选项配置
export const FORMAT_OPTIONS = [
  {
    value: "single" as ComicFormat,
    label: "海报",
    icon: Square,
    description: "单张大图",
  },
  {
    value: "four" as ComicFormat,
    label: "四格漫画",
    icon: Grid2X2,
    description: "2x2网格",
  },
];

// 布局模式选项配置
export const LAYOUT_OPTIONS = [
  { value: "grid-2x2" as LayoutMode, label: "2×2网格", icon: Grid2X2 },
  { value: "vertical-strip" as LayoutMode, label: "竖向条漫", icon: Square },
  { value: "horizontal-strip" as LayoutMode, label: "横向条漫", icon: Square },
  { value: "comic-book" as LayoutMode, label: "漫画书", icon: Square },
];

// 样式常量 - 使用主题变量
export const COMIC_DISPLAY_STYLES = {
  container:
    "bg-card rounded-2xl shadow-lg p-6 h-full flex flex-col border border-border",
  header: "flex items-center gap-3 mb-6",
  title: "text-xl font-bold text-foreground",
  centerContent: "flex-1 flex items-center justify-center",

  // 控制面板样式
  controlPanel: "mb-6 space-y-4",
  controlGroup: "space-y-2",
  controlLabel: "text-sm font-medium text-foreground",
  optionGrid: "grid grid-cols-2 gap-2",
  optionButton:
    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm",
  optionButtonActive: "bg-primary/10 border-primary/30 text-primary",
  optionButtonInactive:
    "bg-secondary border-border text-muted-foreground hover:bg-secondary/50",

  // 漫画相关样式
  comicContainer: "w-full max-w-4xl mx-auto",
  posterContainer: "w-full max-w-3xl mx-auto",
  poster43Container: "w-full max-w-5xl mx-auto",
  comicBook:
    "bg-gradient-to-br from-secondary via-accent/30 to-primary/20 p-8 rounded-lg shadow-2xl border border-border relative overflow-hidden group",

  // 不同布局模式的网格样式
  comicGrids: {
    "grid-2x2": "grid grid-cols-2 gap-6 relative z-10",
    "vertical-strip": "grid grid-cols-1 gap-4 relative z-10",
    "horizontal-strip": "grid grid-cols-4 gap-3 relative z-10",
    "comic-book": "grid grid-cols-2 gap-8 relative z-10",
  },

  // 场景相关样式
  sceneContainer: "relative group",
  scenePanels: {
    default:
      "aspect-square bg-card border-4 border-border rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center",
    single:
      "aspect-[3/4] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-md mx-auto",
    poster43:
      "aspect-[4/3] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-4xl mx-auto",
    horizontal:
      "aspect-[1/1.2] bg-card border-4 border-border rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center",
    "comic-book":
      "aspect-[3/4] bg-card border-4 border-border rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center",
  },
  sceneImage: "max-w-full max-h-full object-contain",
  posterImage: "w-full h-full object-contain max-w-[1024px] max-h-[768px]",

  sceneNumber:
    "absolute top-2 left-2 bg-secondary border-2 border-primary/30 rounded-full w-8 h-8 flex items-center justify-center",

  // 按钮样式
  generateButton:
    "w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
  downloadButton:
    "absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm text-foreground rounded-full hover:bg-card hover:shadow-lg transition-all duration-300 border border-border opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30",
  downloadButtonLegacy:
    "flex items-center gap-2 px-6 py-3 btn-theme-primary rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105",

  // 编辑相关样式
  editOverlay:
    "absolute inset-0 bg-card border-4 border-border rounded-sm p-4 shadow-lg z-20",
  editButton:
    "absolute top-2 right-2 bg-primary text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/80 disabled:opacity-50 shadow-lg border-2 border-card",
} as const;
