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
      "cute chibi {type} portrait, facing forward, dot eyes, simple smile, soft pastel colors, preserve original hairstyle and clothing, minimal shading, clean background, kawaii, adorable expression, round face, blush cheeks, Q version style",
    "three-view":
      "cute chibi {type} 3-view character sheet, front side back views, consistent design, dot eyes, simple colors, kawaii style, Q version proportions",
    "full-body":
      "cute chibi {type} full body, standing pose, dot eyes, simple smile, kawaii proportions, soft colors, Q version style",
    custom: "cute chibi {type}, kawaii, dot eyes, adorable, Q version",
  },

  chinese: {
    avatar:
      "traditional Chinese painting style, cute {type} portrait with Chinese elements, facing forward, big kawaii eyes, soft smile, preserve original hairstyle and clothing, ink wash colors with gold accents, adorable expression, traditional hair ornaments, gentle features, Chinese art style",
    "three-view":
      "traditional Chinese art style, 3-view cute Chinese {type}, front side back views, kawaii features, traditional elements, ink wash colors",
    "full-body":
      "traditional Chinese painting style, cute Chinese {type} full body, traditional pose, kawaii features, soft ink colors, adorable expression",
    custom:
      "traditional Chinese art style, cute {type}, kawaii, traditional elements, adorable",
  },

  labubu: {
    avatar:
      "Pop Mart Labubu toy style, ultra cute round chubby {type} portrait, facing forward, extremely round puffy face, huge sparkling kawaii eyes, tiny dot mouth, preserve original hairstyle and clothing, soft vinyl toy colors, 3D toy aesthetic, maximum adorable expression, balloon-like rounded features, Labubu character design",
    "three-view":
      "Pop Mart Labubu toy style, 3-view ultra round chubby {type}, front side back views, balloon proportions, kawaii toy features, vinyl colors, Labubu design",
    "full-body":
      "Pop Mart Labubu toy style, ultra cute round {type} full body, balloon proportions, kawaii pose, soft vinyl colors, maximum adorable, toy character design",
    custom:
      "Pop Mart Labubu style, ultra round chubby {type}, kawaii toy, maximum adorable, balloon features",
  },

  anime: {
    avatar:
      "anime manga style, kawaii {type} portrait, facing forward, large sparkling eyes, cute smile, preserve original hairstyle and clothing, vibrant but soft colors, adorable expression, anime girl/boy features, blush, innocent look, Japanese animation style",
    "three-view":
      "anime manga style, 3-view kawaii {type}, front side back views, large eyes, cute features, vibrant colors, Japanese animation",
    "full-body":
      "anime manga style, kawaii {type} full body, cute pose, large eyes, adorable expression, vibrant colors, Japanese animation",
    custom:
      "anime manga style, kawaii {type}, large eyes, cute, adorable, Japanese animation",
  },

  ghibli: {
    avatar:
      "Studio Ghibli film style, cute {type} portrait, facing forward, warm gentle expression, preserve original hairstyle and clothing, soft natural lighting, Miyazaki character design, innocent kawaii features, warm earth tones, wholesome atmosphere, hand-drawn animation style",
    "three-view":
      "Studio Ghibli style, 3-view cute {type}, front side back views, Miyazaki character design, warm natural colors, hand-drawn animation",
    "full-body":
      "Studio Ghibli style, cute {type} full body, Miyazaki film character, warm natural lighting, innocent expression, hand-drawn animation",
    custom:
      "Studio Ghibli style, cute {type}, Miyazaki character, warm, innocent, hand-drawn animation",
  },

  pixel: {
    avatar:
      "16-bit pixel art style, cute {type} portrait, facing forward, kawaii pixel design, preserve original hairstyle and clothing, limited retro color palette, pixel perfect, 8-bit game character, adorable pixelated expression, retro gaming aesthetic",
    "three-view":
      "16-bit pixel art style, 3-view cute {type}, front side back views, kawaii pixel design, limited retro colors, 8-bit gaming",
    "full-body":
      "16-bit pixel art style, cute {type} full body, kawaii pixel character, retro game design, adorable pose, 8-bit aesthetic",
    custom:
      "16-bit pixel art style, cute {type}, kawaii pixel design, adorable, 8-bit gaming",
  },

  watercolor: {
    avatar:
      "soft watercolor painting style, cute {type} portrait, facing forward, gentle kawaii features, preserve original hairstyle and clothing, flowing pastel watercolors, adorable expression, soft brush strokes, dreamy atmosphere, traditional watercolor technique",
    "three-view":
      "soft watercolor painting style, 3-view cute {type}, front side back views, gentle kawaii design, flowing pastel colors, traditional watercolor",
    "full-body":
      "soft watercolor painting style, cute {type} full body, gentle kawaii design, flowing colors, adorable pose, traditional watercolor technique",
    custom:
      "soft watercolor painting style, cute {type}, kawaii, flowing colors, adorable, traditional watercolor",
  },

  sketch: {
    avatar:
      "hand-drawn pencil sketch style, cute {type} portrait, facing forward, kawaii features, preserve original hairstyle and clothing, soft pencil lines, adorable expression, gentle shading, warm sketch technique, innocent look, traditional drawing",
    "three-view":
      "hand-drawn pencil sketch style, 3-view cute {type}, front side back views, kawaii sketch design, soft pencil lines, traditional drawing",
    "full-body":
      "hand-drawn pencil sketch style, cute {type} full body, kawaii sketch design, soft shading, adorable pose, traditional drawing technique",
    custom:
      "hand-drawn pencil sketch style, cute {type}, kawaii design, soft lines, adorable, traditional drawing",
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
