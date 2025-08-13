export interface FluxConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface FluxGenerationOptions {
  prompt?: string;
  input_image?: string | null; // Base64 encoded image or URL to use with Kontext
  aspectRatio?: string;
  width?: number;
  height?: number;
  seed?: number;
  outputFormat?: "png" | "jpeg";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface FluxGenerationResult {
  id: string;
  status: "pending" | "processing" | "Ready" | "Error" | "Failed";
  imageUrl?: string;
  pollingUrl?: string;
  generatedAt: string;
  prompt?: string;
  error?: string;
  progress?: number; // 0-100
}

export interface FluxAPIResponse {
  id: string;
  status: string;
  polling_url?: string;
  result?: {
    sample?: string;
  };
  error?: string;
  message?: string;
}

// 风格类型枚举 - 全部都是可爱风格
export type CharacterStyle =
  | "chibi" // 豆豆眼可爱风
  | "chinese" // 可爱国风
  | "labubu" // Labubu可爱风
  | "anime" // 可爱动漫风
  | "ghibli" // 吉卜力工作室风
  | "pixel" // 像素可爱风
  | "watercolor" // 水彩可爱风
  | "sketch"; // 手绘可爱风

// 视图类型
export type ViewType = "avatar" | "three-view";

// 风格配置接口
export interface StyleConfig {
  name: string;
  description: string;
  basePrompt: string;
  aspectRatio: string;
  featureMapping: FeatureMapping[];
  negativePrompt?: string;
  additionalParams?: Partial<FluxGenerationOptions>;
}

// 特征映射配置
export interface FeatureMapping {
  keywords: string[];
  getPrompt: (context?: FeatureContext) => string;
  priority?: number; // 优先级，数字越大越优先
}

// 特征上下文 - 更新版本
export interface FeatureContext {
  tags?: string[];
  style: CharacterStyle;
  viewType: ViewType;
  gender?: "male" | "female" | "unknown";
  age?: "young" | "adult" | "elderly" | "unknown";
  animalType?: string;
}

// 更新的角色生成选项
export interface FluxCharacterOptions {
  image: string; // base64 encoded image
  style: CharacterStyle;
  viewType: ViewType;
  tags?: string[];
  customStyleConfig?: Partial<StyleConfig>; // 用于自定义风格
  additionalPrompt?: string; // 额外的提示词
}
