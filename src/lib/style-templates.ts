import { CharacterStyle, ViewType } from "@/types/flux";

/**
 * 风格模板系统 - 为每个风格和视图类型提供专门的提示词模板
 */

export interface StyleTemplate {
  [key: string]: string;
}

export const styleTemplates: Record<CharacterStyle, StyleTemplate> = {
  chibi: {
    avatar:
      "anime style, cute chibi {type} portrait, facing forward, dot eyes, simple smile, soft pastel colors, preserve original hairstyle and clothing, minimal shading, clean background, kawaii, adorable expression, round face, blush cheeks",
    "three-view":
      "anime style, 3-view character sheet of cute chibi {type}, front side back views, consistent design, dot eyes, simple colors, kawaii style",
    "full-body":
      "anime style, cute chibi {type} full body, standing pose, dot eyes, simple smile, kawaii proportions, soft colors",
    custom: "anime style, cute chibi {type}, kawaii, dot eyes, adorable",
  },

  chinese: {
    avatar:
      "anime style, cute {type} portrait with traditional Chinese elements, facing forward, big kawaii eyes, soft smile, preserve original hairstyle and clothing, pastel colors with gold accents, adorable expression, traditional hair ornaments, gentle features",
    "three-view":
      "anime style, 3-view cute Chinese style {type}, front side back views, kawaii features, traditional elements, soft colors",
    "full-body":
      "anime style, cute Chinese style {type} full body, traditional pose, kawaii features, soft colors, adorable expression",
    custom:
      "anime style, cute Chinese {type}, kawaii, traditional elements, adorable",
  },

  labubu: {
    avatar:
      "anime style, cute Labubu style {type} portrait, facing forward, very round chubby face, huge kawaii eyes with sparkles, tiny mouth, preserve original hairstyle and clothing, soft pastel colors, vinyl toy aesthetic, extremely adorable expression, rounded features",
    "three-view":
      "anime style, 3-view Labubu style {type}, front side back views, round chubby design, kawaii features, pastel colors",
    "full-body":
      "anime style, cute Labubu {type} full body, round proportions, kawaii pose, soft pastel colors, adorable",
    custom: "anime style, cute Labubu {type}, round chubby, kawaii, adorable",
  },

  anime: {
    avatar:
      "anime style, kawaii {type} portrait, facing forward, large sparkling eyes, cute smile, preserve original hairstyle and clothing, vibrant but soft colors, adorable expression, anime girl/boy features, blush, innocent look",
    "three-view":
      "anime style, 3-view kawaii {type}, front side back views, large eyes, cute features, vibrant colors",
    "full-body":
      "anime style, kawaii {type} full body, cute pose, large eyes, adorable expression, vibrant colors",
    custom: "anime style, kawaii {type}, large eyes, cute, adorable",
  },

  ghibli: {
    avatar:
      "Studio Ghibli style, cute {type} portrait, facing forward, warm gentle expression, preserve original hairstyle and clothing, soft natural lighting, Miyazaki film character style, innocent kawaii features, warm colors, wholesome atmosphere",
    "three-view":
      "Studio Ghibli style, 3-view cute {type}, front side back views, Miyazaki character design, warm colors",
    "full-body":
      "Studio Ghibli style, cute {type} full body, Miyazaki film character, warm lighting, innocent expression",
    custom:
      "Studio Ghibli style, cute {type}, Miyazaki character, warm, innocent",
  },

  pixel: {
    avatar:
      "16-bit pixel art, cute {type} portrait, facing forward, kawaii pixel style, preserve original hairstyle and clothing, limited cute color palette, pixel perfect, retro game character, adorable 8-bit expression",
    "three-view":
      "16-bit pixel art, 3-view cute {type}, front side back views, kawaii pixel style, limited colors",
    "full-body":
      "16-bit pixel art, cute {type} full body, kawaii pixel character, retro game style, adorable pose",
    custom: "16-bit pixel art, cute {type}, kawaii pixel style, adorable",
  },

  watercolor: {
    avatar:
      "watercolor painting, cute {type} portrait, facing forward, soft kawaii features, preserve original hairstyle and clothing, gentle pastel watercolors, adorable expression, soft brush strokes, dreamy atmosphere",
    "three-view":
      "watercolor painting, 3-view cute {type}, front side back views, soft kawaii style, pastel colors",
    "full-body":
      "watercolor painting, cute {type} full body, soft kawaii style, gentle colors, adorable pose",
    custom: "watercolor painting, cute {type}, kawaii, soft colors, adorable",
  },

  sketch: {
    avatar:
      "pencil sketch, cute {type} portrait, facing forward, kawaii features, preserve original hairstyle and clothing, soft pencil lines, adorable expression, gentle shading, warm sketch style, innocent look",
    "three-view":
      "pencil sketch, 3-view cute {type}, front side back views, kawaii sketch style, soft lines",
    "full-body":
      "pencil sketch, cute {type} full body, kawaii sketch style, soft shading, adorable pose",
    custom: "pencil sketch, cute {type}, kawaii style, soft lines, adorable",
  },
};

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
