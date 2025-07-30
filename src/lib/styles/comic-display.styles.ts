import { ComicFormat, LayoutMode } from "@/types/diary";
import { Square, Grid2X2 } from "lucide-react";

// 格式选项配置
export const FORMAT_OPTIONS = [
  { value: "single" as ComicFormat, label: "海报", icon: Square },
  { value: "four" as ComicFormat, label: "四格漫画", icon: Grid2X2 },
];

// 布局模式选项配置
export const LAYOUT_OPTIONS = [
  { value: "grid-2x2" as LayoutMode, label: "2×2网格", icon: Grid2X2 },
  { value: "vertical-strip" as LayoutMode, label: "竖向条漫", icon: Square },
  { value: "horizontal-strip" as LayoutMode, label: "横向条漫", icon: Square },
  { value: "comic-book" as LayoutMode, label: "漫画书", icon: Square },
];

// 样式常量
export const COMIC_DISPLAY_STYLES = {
  container: "bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col",
  header: "flex items-center gap-3 mb-6",
  title: "text-xl font-bold text-gray-800",
  centerContent: "flex-1 flex items-center justify-center",

  // 控制面板样式
  controlPanel: "mb-6 space-y-4",
  controlGroup: "space-y-2",
  controlLabel: "text-sm font-medium text-gray-700",
  optionGrid: "grid grid-cols-2 gap-2",
  optionButton:
    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm",
  optionButtonActive: "bg-purple-100 border-purple-300 text-purple-700",
  optionButtonInactive:
    "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",

  // 漫画相关样式 - 优化容器尺寸
  comicContainer: "w-full max-w-4xl mx-auto", // 增大最大宽度
  posterContainer: "w-full max-w-3xl mx-auto", // 专门为poster设计的容器
  poster43Container: "w-full max-w-5xl mx-auto", // 专门为4:3海报设计的容器
  comicBook:
    "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 rounded-lg shadow-2xl border border-amber-200 relative overflow-hidden group",

  // 不同布局模式的网格样式
  comicGrids: {
    "grid-2x2": "grid grid-cols-2 gap-6 relative z-10",
    "vertical-strip": "grid grid-cols-1 gap-4 relative z-10",
    "horizontal-strip": "grid grid-cols-4 gap-3 relative z-10",
    "comic-book": "grid grid-cols-2 gap-8 relative z-10",
  },

  // 场景相关样式 - 优化poster尺寸
  sceneContainer: "relative group",
  scenePanels: {
    default:
      "aspect-square bg-white border-4 border-amber-200 rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center",
    single:
      "aspect-[3/4] bg-white border-4 border-amber-200 rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-md mx-auto", // 优化单格尺寸
    poster43:
      "aspect-[4/3] bg-white border-4 border-amber-200 rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center w-full max-w-4xl mx-auto", // 专门的4:3海报样式
    horizontal:
      "aspect-[1/1.2] bg-white border-4 border-amber-200 rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center",
    "comic-book":
      "aspect-[3/4] bg-white border-4 border-amber-200 rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center",
  },
  sceneImage: "max-w-full max-h-full object-contain",

  // 添加专门的海报图片样式
  posterImage: "w-full h-full object-contain max-w-[1024px] max-h-[768px]",

  sceneNumber:
    "absolute top-2 left-2 bg-amber-100 border-2 border-amber-300 rounded-full w-8 h-8 flex items-center justify-center",

  // 按钮样式 - 优化下载按钮
  generateButton:
    "w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
  downloadButton:
    "absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30",
  // 保留旧样式作为备用
  downloadButtonLegacy:
    "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg border-2 border-blue-700 transform hover:scale-105",

  // 编辑相关样式
  editOverlay:
    "absolute inset-0 bg-white border-4 border-amber-200 rounded-sm p-4 shadow-lg z-20",
  editButton:
    "absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600 disabled:opacity-50 shadow-lg border-2 border-white",

  // Dropdown样式
  dropdown: {
    button:
      "flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium text-gray-700 shadow-sm min-w-[120px] justify-between",
    menu: "absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50",
    item: "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-200",
    itemSelected: "bg-purple-50 text-purple-700",
    itemDefault: "text-gray-700",
  },
} as const;
