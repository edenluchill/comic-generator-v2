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
