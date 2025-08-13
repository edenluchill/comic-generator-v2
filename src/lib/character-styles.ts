import {
  CharacterStyle,
  StyleConfig,
  FeatureMapping,
  FeatureContext,
} from "@/types/flux";

/**
 * 年龄相关的特征映射
 */
const ageRelatedFeatureMapping: FeatureMapping[] = [
  {
    keywords: [
      "old",
      "elderly",
      "aged",
      "wrinkled",
      "gray_hair",
      "grey_hair",
      "white_hair",
    ],
    getPrompt: (context) => {
      const ageFeatures = [];
      if (context?.tags?.some((tag) => tag.includes("wrinkled"))) {
        ageFeatures.push("gentle wrinkles showing wisdom and character");
      }
      if (
        context?.tags?.some(
          (tag) =>
            tag.includes("gray") ||
            tag.includes("grey") ||
            tag.includes("white")
        )
      ) {
        ageFeatures.push("beautiful silver or gray hair");
      }

      switch (context?.style) {
        case "chinese":
          return `elderly features with traditional Chinese wisdom, ${ageFeatures.join(
            ", "
          )}`;
        case "labubu":
          return `cute elderly features in soft Labubu style, ${ageFeatures.join(
            ", "
          )}`;
        case "ghibli":
          return `warm elderly character with Ghibli charm, ${ageFeatures.join(
            ", "
          )}`;
        default:
          return `distinguished elderly features, ${ageFeatures.join(", ")}`;
      }
    },
    priority: 3,
  },
  {
    keywords: ["round_glasses", "glasses"],
    getPrompt: (context) => {
      const isElderly = context?.tags?.some((tag) =>
        ["old", "elderly", "aged"].some((keyword) => tag.includes(keyword))
      );

      switch (context?.style) {
        case "chinese":
          return isElderly
            ? "traditional Chinese style reading glasses"
            : "traditional Chinese style glasses with thin frames";
        case "labubu":
          return "cute round glasses in soft Labubu style";
        case "pixel":
          return "pixelated glasses with simple geometric shapes";
        default:
          return isElderly
            ? "wise-looking reading glasses"
            : "simple stylish glasses";
      }
    },
    priority: 2,
  },
  {
    keywords: ["curly_hair"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "elegant curly hair with traditional Chinese styling";
        case "labubu":
          return "soft curly hair in cute Labubu style";
        case "ghibli":
          return "natural curly hair with Ghibli warmth";
        default:
          return "beautiful curly hair with natural flow";
      }
    },
    priority: 2,
  },
  {
    keywords: ["traditional_clothing"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "chinese":
          return "authentic traditional Chinese clothing with cultural details";
        case "labubu":
          return "traditional clothing adapted to cute Labubu style";
        case "ghibli":
          return "traditional clothing with Ghibli film aesthetic";
        default:
          return "elegant traditional clothing with cultural authenticity";
      }
    },
    priority: 2,
  },
  {
    keywords: ["serious_face", "stern"],
    getPrompt: (context) => {
      switch (context?.style) {
        case "labubu":
          return "gently serious expression maintaining Labubu cuteness";
        case "ghibli":
          return "thoughtful serious expression with Ghibli warmth";
        default:
          return "dignified serious expression showing character";
      }
    },
    priority: 1,
  },
];

/**
 * 通用特征映射 - 更新版本
 */
const commonFeatureMapping: FeatureMapping[] = [
  ...ageRelatedFeatureMapping,
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
