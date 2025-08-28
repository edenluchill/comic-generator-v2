// 漫画格式类型
export type ComicFormat = "single" | "four";

// 排版模式类型
export type LayoutMode =
  | "grid-2x2"
  | "vertical-strip"
  | "horizontal-strip"
  | "comic-book";

export interface Comic {
  id: string;
  user_id: string;
  title?: string;
  content: string; // 原始内容（直接存储，不再依赖diary）
  mood?: string; // 情绪标签
  date: string; // 创建日期
  style: "cute" | "realistic" | "minimal" | "kawaii";
  scene_ids: string[]; // 存储场景ID的数组，按顺序排列
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  scenes?: ComicScene[];
}

export interface ComicScene {
  id: string;
  comic_id: string;
  scene_order: number;
  content: string; // 原始内容字段
  scenario_description: string;
  mood?: string;
  quote?: string; // 装逼话/哲理名言
  image_url?: string;
  image_prompt?: string;
  status: "pending" | "processing" | "completed" | "failed" | "retry";
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateComicData {
  title?: string;
  content: string; // 直接使用content而不是diary_content
  mood?: string;
  date?: string;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
}

export interface SceneDescription {
  scene_number: number;
  description: string;
  mood?: string; // 场景情绪
}

// 简化请求接口
export interface ComicGenerationRequest extends Record<string, unknown> {
  content: string; // 使用content而不是diary_content
  style?: "cute" | "realistic" | "minimal" | "kawaii";
  comic_id?: string; // 可选，如果是为现有comic添加新场景
}

export interface ComicGenerationProgress {
  step:
    | "analyzing"
    | "generating_scenes"
    | "generating_images"
    | "completed"
    | "failed";
  current_scene?: number;
  total_scenes: number;
  message: string;
  progress: number; // 0-100
}

// 简化生成结果
export interface ComicGenerationResult {
  comic_id: string;
  scenes: ComicScene[];
  status: "completed" | "failed";
  error?: string;
}
