export interface Diary {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: string;
  date: string;
  status: "draft" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface CreateDiaryData {
  title?: string;
  content: string;
  mood?: string;
  date?: string;
}

export interface Comic {
  id: string;
  diary_id: string;
  user_id: string;
  title?: string;
  style: "cute" | "realistic" | "minimal" | "kawaii";
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  scenes?: ComicScene[];
}

export interface SceneCharacter {
  id: string;
  name: string;
  avatar_url: string;
}

export interface ComicScene {
  id: string;
  comic_id: string;
  scene_order: number;
  scenario_description: string;
  mood?: string;
  image_url?: string;
  image_prompt?: string;
  characters: SceneCharacter[];
  status: "pending" | "processing" | "completed" | "failed" | "retry";
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateComicData {
  diary_id: string;
  title?: string;
  style?: "cute" | "realistic" | "minimal" | "kawaii";
  characters: SceneCharacter[]; // 完整的角色信息数组
}

export interface SceneDescription {
  scene_number: number;
  description: string;
  character_ids: string[]; // 场景中需要的角色ID
  mood?: string; // 场景情绪
}

export interface ComicGenerationRequest extends Record<string, unknown> {
  diary_content: string;
  characters: SceneCharacter[]; // 完整的角色信息数组
  style?: "cute" | "realistic" | "minimal" | "kawaii";
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

export interface ComicGenerationResult {
  comic_id: string;
  scenes: ComicScene[];
  status: "completed" | "failed";
  error?: string;
}
