import {
  CharacterStyle,
  ViewType,
  StyleConfig,
  FeatureContext,
  FluxCharacterOptions,
  FluxGenerationOptions,
} from "@/types/flux";
import { getStyleConfig } from "./character-styles";
import { getStyleTemplate } from "./style-templates";

/**
 * 智能提示词生成器
 */
export class PromptGenerator {
  /**
   * 从标签中识别角色类型和性别
   */
  private analyzeCharacterFromTags(tags?: string[]): {
    type: string;
    gender?: "male" | "female" | "unknown";
    animalType?: string;
  } {
    if (!tags || tags.length === 0) {
      return { type: "character", gender: "unknown" };
    }

    // 性别识别
    let gender: "male" | "female" | "unknown" = "unknown";
    if (
      tags.some(
        (tag) =>
          tag.includes("girl") ||
          tag.includes("woman") ||
          tag.includes("female")
      )
    ) {
      gender = "female";
    } else if (
      tags.some(
        (tag) =>
          tag.includes("boy") || tag.includes("man") || tag.includes("male")
      )
    ) {
      gender = "male";
    }

    // 类型识别
    let type = "character";
    let animalType: string | undefined;

    // 动物类型检测
    const animalKeywords = [
      "dog",
      "cat",
      "rabbit",
      "fox",
      "bear",
      "panda",
      "tiger",
      "lion",
    ];
    for (const animal of animalKeywords) {
      if (tags.some((tag) => tag.includes(animal))) {
        type = animal;
        animalType = animal;
        break;
      }
    }

    // 如果不是动物，根据性别确定类型
    if (!animalType) {
      if (gender === "female") {
        type = "girl";
      } else if (gender === "male") {
        type = "boy";
      } else {
        type = "person";
      }
    }

    return { type, gender, animalType };
  }

  /**
   * 生成特征提示词
   */
  private generateFeaturePrompts(
    styleConfig: StyleConfig,
    context: FeatureContext
  ): string[] {
    const featurePrompts: string[] = [];
    const { tags = [] } = context;

    // 按优先级排序特征映射
    const sortedFeatures = [...styleConfig.featureMapping].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    // 处理每个特征映射
    for (const feature of sortedFeatures) {
      const hasFeature = feature.keywords.some((keyword) =>
        tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))
      );

      if (hasFeature) {
        const prompt = feature.getPrompt(context);
        if (prompt) {
          featurePrompts.push(prompt);
        }
      }
    }

    // 处理样式保留
    const stylePreservation: string[] = [];
    const preserveKeywords = ["hair", "tail", "clothing", "accessory"];

    for (const keyword of preserveKeywords) {
      const matchingTags = tags.filter((tag) =>
        tag.toLowerCase().includes(keyword)
      );
      if (matchingTags.length > 0) {
        stylePreservation.push(
          `preserve the ${matchingTags.join(", ")} style from the input image`
        );
      }
    }

    return [...featurePrompts, ...stylePreservation];
  }

  /**
   * 构建完整的提示词
   */
  private buildPrompt(
    basePrompt: string,
    characterType: string,
    featurePrompts: string[],
    additionalPrompt?: string
  ): string {
    // 替换基础提示词中的占位符
    let prompt = basePrompt.replace(/\{type\}/g, characterType);

    // 添加特征提示词
    if (featurePrompts.length > 0) {
      prompt += `, additional features: ${featurePrompts.join(", ")}`;
    }

    // 添加额外提示词
    if (additionalPrompt) {
      prompt += `, ${additionalPrompt}`;
    }

    return prompt;
  }

  /**
   * 生成角色提示词
   */
  generatePrompt(options: FluxCharacterOptions): {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: string;
    additionalParams?: Partial<FluxGenerationOptions>;
  } {
    const { style, viewType, tags, additionalPrompt, customStyleConfig } =
      options;

    // 获取风格配置
    const styleConfig = getStyleConfig(style);

    // 分析角色信息
    const characterAnalysis = this.analyzeCharacterFromTags(tags);

    // 创建特征上下文
    const context: FeatureContext = {
      tags,
      style,
      viewType,
      gender: characterAnalysis.gender,
      animalType: characterAnalysis.animalType,
    };

    // 获取基础提示词模板
    const basePromptTemplate =
      customStyleConfig?.basePrompt || getStyleTemplate(style, viewType);

    // 生成特征提示词
    const featurePrompts = this.generateFeaturePrompts(styleConfig, context);

    // 构建最终提示词
    const prompt = this.buildPrompt(
      basePromptTemplate,
      characterAnalysis.type,
      featurePrompts,
      additionalPrompt
    );

    return {
      prompt,
      negativePrompt: styleConfig.negativePrompt,
      aspectRatio: styleConfig.aspectRatio,
      additionalParams: styleConfig.additionalParams,
    };
  }

  /**
   * 获取推荐的生成参数
   */
  getRecommendedParams(
    style: CharacterStyle,
    viewType: ViewType
  ): {
    width?: number;
    height?: number;
    aspectRatio: string;
  } {
    const styleConfig = getStyleConfig(style);
    const aspectRatio = styleConfig.aspectRatio;

    // 根据宽高比和视图类型推荐尺寸
    const sizeMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "3:4": { width: 768, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "16:9": { width: 1024, height: 576 },
    };

    const baseSize = sizeMap[aspectRatio] || sizeMap["1:1"];

    // 三视图通常需要更宽的画布
    if (viewType === "three-view") {
      return {
        width: Math.max(baseSize.width, 1024),
        height: baseSize.height,
        aspectRatio: "4:3",
      };
    }

    return {
      width: baseSize.width,
      height: baseSize.height,
      aspectRatio,
    };
  }
}

// 创建单例实例
export const promptGenerator = new PromptGenerator();
