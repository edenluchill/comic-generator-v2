import { CharacterStyle, ViewType } from "@/types/flux";

/**
 * 风格模板系统 - 为每个风格和视图类型提供专门的提示词模板
 */

export interface StyleTemplate {
  [key: string]: string;
}

/**
 * 公共的三视图模板部分
 */
const COMMON_THREE_VIEW_STRUCTURE =
  "character sheet turnaround, {stylePrefix} EXACTLY THREE POSES: front view facing forward + side view profile + back view from behind, same character consistent design, {styleFeatures}, white background, reference sheet layout, model sheet, orthographic views";

/**
 * 风格特定的前缀和特征
 */
const STYLE_CONFIGS = {
  chibi: {
    avatarPrefix: "cute chibi {type} portrait, facing forward",
    avatarFeatures:
      "dot eyes, simple smile, soft pastel colors, preserve original hairstyle and clothing, minimal shading, clean background, kawaii, adorable expression, round face, blush cheeks, Q version style",
    threeViewPrefix: "cute chibi {type}",
    threeViewFeatures:
      "dot eyes, simple colors, kawaii style, Q version proportions",
  },
  chinese: {
    avatarPrefix:
      "traditional Chinese painting style, cute {type} portrait with Chinese elements, facing forward",
    avatarFeatures:
      "big kawaii eyes, soft smile, preserve original hairstyle and clothing, ink wash colors with gold accents, adorable expression, traditional hair ornaments, gentle features, Chinese art style",
    threeViewPrefix: "traditional Chinese art style cute {type}",
    threeViewFeatures: "kawaii features, traditional elements, ink wash colors",
  },
  labubu: {
    avatarPrefix:
      "Pop Mart Labubu toy style, ultra cute {type} portrait, facing forward",
    avatarFeatures:
      "soft round face with gentle curves, huge sparkling kawaii eyes, tiny dot mouth, preserve original hairstyle and clothing, soft vinyl toy colors, 3D toy aesthetic, maximum adorable expression, smooth rounded features without excessive puffiness, Labubu character design",
    threeViewPrefix: "Pop Mart Labubu toy style ultra cute {type}",
    threeViewFeatures:
      "gentle round proportions, kawaii toy features, vinyl colors, Labubu design",
  },
  anime: {
    avatarPrefix: "anime manga style, kawaii {type} portrait, facing forward",
    avatarFeatures:
      "large sparkling eyes, cute smile, preserve original hairstyle and clothing, vibrant but soft colors, adorable expression, anime girl/boy features, blush, innocent look, Japanese animation style",
    threeViewPrefix: "anime manga style kawaii {type}",
    threeViewFeatures:
      "large eyes, cute features, vibrant colors, Japanese animation",
  },
  ghibli: {
    avatarPrefix:
      "Studio Ghibli film style, cute {type} portrait, facing forward",
    avatarFeatures:
      "warm gentle expression, preserve original hairstyle and clothing, soft natural lighting, Miyazaki character design, innocent kawaii features, warm earth tones, wholesome atmosphere, hand-drawn animation style",
    threeViewPrefix: "Studio Ghibli style cute {type}",
    threeViewFeatures:
      "Miyazaki character design, warm natural colors, hand-drawn animation",
  },
  pixel: {
    avatarPrefix:
      "16-bit pixel art style, cute {type} portrait, facing forward",
    avatarFeatures:
      "kawaii pixel design, preserve original hairstyle and clothing, limited retro color palette, pixel perfect, 8-bit game character, adorable pixelated expression, retro gaming aesthetic",
    threeViewPrefix: "16-bit pixel art style cute {type}",
    threeViewFeatures:
      "kawaii pixel design, limited retro colors, 8-bit gaming",
  },
  watercolor: {
    avatarPrefix:
      "soft watercolor painting style, cute {type} portrait, facing forward",
    avatarFeatures:
      "gentle kawaii features, preserve original hairstyle and clothing, flowing pastel watercolors, adorable expression, soft brush strokes, dreamy atmosphere, traditional watercolor technique",
    threeViewPrefix: "soft watercolor painting style cute {type}",
    threeViewFeatures:
      "gentle kawaii design, flowing pastel colors, traditional watercolor",
  },
  sketch: {
    avatarPrefix:
      "hand-drawn pencil sketch style, cute {type} portrait, facing forward",
    avatarFeatures:
      "kawaii features, preserve original hairstyle and clothing, soft pencil lines, adorable expression, gentle shading, warm sketch technique, innocent look, traditional drawing",
    threeViewPrefix: "hand-drawn pencil sketch style cute {type}",
    threeViewFeatures:
      "kawaii sketch design, soft pencil lines, traditional drawing",
  },
};

/**
 * 动态生成风格模板
 */
export const styleTemplates: Record<CharacterStyle, StyleTemplate> =
  Object.entries(STYLE_CONFIGS).reduce((acc, [style, config]) => {
    acc[style as CharacterStyle] = {
      avatar: `${config.avatarPrefix}, ${config.avatarFeatures}`,
      "three-view": COMMON_THREE_VIEW_STRUCTURE.replace(
        "{stylePrefix}",
        config.threeViewPrefix
      ).replace("{styleFeatures}", config.threeViewFeatures),
    };
    return acc;
  }, {} as Record<CharacterStyle, StyleTemplate>);

/**
 * 获取指定风格和视图类型的模板
 */
export function getStyleTemplate(
  style: CharacterStyle,
  viewType: ViewType
): string {
  const templates = styleTemplates[style];
  return templates[viewType] || templates.custom || templates.avatar;
}
