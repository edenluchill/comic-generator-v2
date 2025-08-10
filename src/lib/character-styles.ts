import {
  CharacterStyle,
  StyleConfig,
  FeatureMapping,
  FeatureContext,
} from "@/types/flux";

/**
 * 通用特征映射 - 可被多个风格复用
 */
const commonFeatureMapping: FeatureMapping[] = [
  {
    keywords: ["glasses"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "traditional Chinese style glasses with thin frames";
        case "labubu":
          return "round cute glasses in Labubu style";
        case "pixel":
          return "pixelated glasses with simple geometric shapes";
        default:
          return "simple line art glasses as circles/ovals";
      }
    },
    priority: 2,
  },
  {
    keywords: ["hat", "cap"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "traditional Chinese hat or headwear";
        case "labubu":
          return "cute rounded hat in Labubu style";
        default:
          return "hat as simple geometric shape";
      }
    },
    priority: 2,
  },
  {
    keywords: ["short_hair"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "short traditional Chinese hairstyle";
        case "labubu":
          return "short rounded hair in Labubu style";
        default:
          return "short hair with few strokes around head";
      }
    },
    priority: 1,
  },
  {
    keywords: ["earrings"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "traditional Chinese earrings with jade or gold elements";
        case "labubu":
          return "small cute earrings in Labubu style";
        default:
          return "earrings as small simple shapes";
      }
    },
    priority: 1,
  },
];

/**
 * 预定义的风格配置 - 专注于可爱风格
 */
export const styleConfigs: Record<CharacterStyle, StyleConfig> = {
  chibi: {
    name: "Q版可爱风",
    description: "超可爱的Q版角色，大头小身体，简单线条",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: commonFeatureMapping,
    negativePrompt:
      "realistic, detailed shading, complex lighting, photorealistic, ugly, scary, dark, changing original outfit, different clothing, side view, profile view, back view",
  },

  chinese: {
    name: "可爱国风",
    description: "萌萌的中国风角色，保持可爱感",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: [
      ...commonFeatureMapping,
      {
        keywords: ["traditional", "hanfu", "chinese"],
        getPrompt: () =>
          "cute traditional Chinese style with soft colors and adorable features",
        priority: 3,
      },
    ],
    negativePrompt:
      "realistic, serious expression, dark colors, complex details, ugly, scary, changing original outfit, different clothing, side view, profile view, back view",
    additionalParams: {
      promptUpsampling: true,
    },
  },

  labubu: {
    name: "Labubu可爱风",
    description: "Pop Mart Labubu超萌风格",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: [
      ...commonFeatureMapping.map((mapping) => ({
        ...mapping,
        getPrompt: (context: FeatureContext | undefined) =>
          mapping
            .getPrompt(context)
            ?.replace(/simple|line art/, "rounded cute Labubu style") || "",
      })),
      {
        keywords: ["round", "cute"],
        getPrompt: () =>
          "gentle round adorable features in Labubu style with soft curves",
        priority: 3,
      },
    ],
    negativePrompt:
      "sharp edges, angular, realistic, dark colors, ugly, scary, changing original outfit, different clothing, side view, profile view, back view, overly fat, obese, bloated, excessive puffiness, balloon body, inflated features",
  },

  anime: {
    name: "可爱动漫风",
    description: "日系萌系动漫角色",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: [
      ...commonFeatureMapping,
      {
        keywords: ["anime", "manga", "cute"],
        getPrompt: () => "kawaii anime style with big eyes and cute expression",
        priority: 3,
      },
    ],
    negativePrompt:
      "realistic, serious, dark, mature, ugly, scary, changing original outfit, different clothing, side view, profile view, back view",
  },

  ghibli: {
    name: "吉卜力工作室风",
    description: "宫崎骏电影般的温暖可爱风格",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: commonFeatureMapping,
    negativePrompt:
      "realistic photography, dark, scary, ugly, serious expression, changing original outfit, different clothing, side view, profile view, back view",
    additionalParams: {
      promptUpsampling: true,
    },
  },

  pixel: {
    name: "像素可爱风",
    description: "16位游戏风格的可爱像素角色",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: commonFeatureMapping,
    negativePrompt:
      "realistic, smooth, anti-aliasing, dark, scary, ugly, changing original outfit, different clothing, side view, profile view, back view",
  },

  watercolor: {
    name: "水彩可爱风",
    description: "柔和水彩画的可爱角色",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: commonFeatureMapping,
    negativePrompt:
      "hard edges, digital, sharp lines, dark colors, scary, ugly, changing original outfit, different clothing, side view, profile view, back view",
  },

  sketch: {
    name: "手绘可爱风",
    description: "温暖手绘风格的可爱角色",
    basePrompt: "",
    aspectRatio: "1:1",
    featureMapping: commonFeatureMapping,
    negativePrompt:
      "digital, clean lines, realistic, dark, scary, ugly, changing original outfit, different clothing, side view, profile view, back view",
  },
};

/**
 * 获取风格配置
 */
export function getStyleConfig(style: CharacterStyle): StyleConfig {
  return styleConfigs[style];
}

/**
 * 获取所有可用的风格
 */
export function getAvailableStyles(): Array<{
  key: CharacterStyle;
  name: string;
  description: string;
}> {
  return Object.entries(styleConfigs).map(([key, config]) => ({
    key: key as CharacterStyle,
    name: config.name,
    description: config.description,
  }));
}
