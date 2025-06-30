export interface StableDiffusionConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface SketchGenerationOptions {
  image: string; // base64 encoded image
  prompt: string;
  style: "simple" | "detailed" | "cute";
  strength?: number;
  seed?: number;
  cfg_scale?: number;
  steps?: number;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  style: string;
  generatedAt: string;
  seed?: number;
}

export interface StabilityAIError {
  id: string;
  name: string;
  errors: Array<{
    field?: string;
    message: string;
  }>;
}

export interface SketchWithStructureOptions extends SketchGenerationOptions {
  controlStrength?: number;
  structureControl?: {
    structureImage: string;
    controlStrength: number;
  };
}

// 面部标志点坐标 (68点模型)
export interface FaceLandmark {
  x: number;
  y: number;
}

// 面部区域定义
export interface FaceRegions {
  jawline: FaceLandmark[]; // 下颌线 (0-17)
  rightEyebrow: FaceLandmark[]; // 右眉毛 (17-22)
  leftEyebrow: FaceLandmark[]; // 左眉毛 (22-27)
  nose: FaceLandmark[]; // 鼻子 (27-36)
  rightEye: FaceLandmark[]; // 右眼 (36-42)
  leftEye: FaceLandmark[]; // 左眼 (42-48)
  outerMouth: FaceLandmark[]; // 嘴巴轮廓 (48-61)
  innerMouth: FaceLandmark[]; // 嘴巴内部 (61-68)
}

// 面部特征比例分析
export interface FacialFeatureRatios {
  noseWidthToFaceWidth: number; // 鼻子宽度与面部宽度比例
  eyeDistanceToFaceWidth: number; // 眼距与面部宽度比例
  mouthWidthToJawWidth: number; // 嘴宽与下颌宽度比例
  noseLengthToFaceLength: number; // 鼻长与面部长度比例
  eyeHeightToNoseLength: number; // 眼高与鼻长比例
  chinWidthToFaceWidth: number; // 下巴宽度与面部宽度比例
}

// 面部特征描述
export interface FacialFeatureDescriptions {
  nose: string[]; // 如 ["prominent", "wide", "large"]
  eyes: string[]; // 如 ["wide-set", "small", "narrow"]
  mouth: string[]; // 如 ["wide", "thin", "full"]
  face: string[]; // 如 ["round", "oval", "square"]
  eyebrows: string[]; // 如 ["thick", "arched", "straight"]
  chin: string[]; // 如 ["pointed", "round", "wide"]
}

// 面部分析结果
export interface FaceAnalysisResult {
  landmarks: FaceLandmark[]; // 68个标志点
  regions: FaceRegions; // 分区域标志点
  ratios: FacialFeatureRatios; // 特征比例
  descriptions: FacialFeatureDescriptions; // 文字描述
  confidence: number; // 检测置信度
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 面部特征提取选项
export interface FaceExtractionOptions {
  image: string; // base64 encoded image
  confidenceThreshold?: number; // 置信度阈值，默认 0.5
  includeDescriptions?: boolean; // 是否生成特征描述，默认 true
}

// OpenAI 图像分析相关类型
export interface OpenAIImageAnalysisOptions {
  image: string; // base64 encoded image
  maxTokens?: number;
  temperature?: number;
  includeCaricatureFeatures?: boolean;
}

export interface OpenAIFacialAnalysis {
  overallDescription: string;
  facialFeatures: {
    faceShape: string;
    eyeShape: string;
    eyeSize: string;
    eyePosition: string;
    noseShape: string;
    noseSize: string;
    mouthShape: string;
    mouthSize: string;
    jawline: string;
    cheekbones: string;
    forehead: string;
    eyebrows: string;
    chin: string;
  };
  caricatureKeywords: string[];
  artisticDescriptions: string[];
  confidenceScore: number;
  rawResponse: string;
}

// 综合分析结果
export interface CombinedFacialAnalysis {
  mediaPipeAnalysis: FaceAnalysisResult;
  openAIAnalysis: OpenAIFacialAnalysis;
  combinedPrompt: string;
  analysisTimestamp: string;
  processingTime: {
    mediaPipe: number;
    openAI: number;
    total: number;
  };
}
