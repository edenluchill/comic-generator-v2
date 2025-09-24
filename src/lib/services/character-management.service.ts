import { faceAnalysisService } from "./face-analysis.service";
import { geminiImageService, GeminiImageInput } from "./gemini-image.service";
import { UIDataTypes, UIMessagePart, UITools } from "ai";

// 角色分析结果接口
export interface CharacterAnalysisResult {
  id: string;
  originalImageUrl: string;
  tags: string[];
  description: string;
  confidence: number;
}

// 生成的角色接口
export interface GeneratedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  originalImageUrl: string;
  artStyle: string;
  generatedAt: string;
}

// 角色生成选项
export interface CharacterGenerationOptions {
  userId: string;
  artStyle: string;
  characterImages: UIMessagePart<UIDataTypes, UITools>[];
  onProgress?: (data: {
    step: string;
    message: string;
    progress: number;
    currentCharacter?: number;
    totalCharacters?: number;
  }) => void;
}

// 角色生成结果
export interface CharacterGenerationResult {
  characters: GeneratedCharacter[];
  analysisResults: CharacterAnalysisResult[];
  success: boolean;
  errors: string[];
}

export class CharacterManagementService {
  /**
   * 从用户提供的照片中分析和生成角色
   */
  async analyzeAndGenerateCharacters(
    options: CharacterGenerationOptions
  ): Promise<CharacterGenerationResult> {
    const { userId, artStyle, characterImages, onProgress } = options;

    const analysisResults: CharacterAnalysisResult[] = [];
    const generatedCharacters: GeneratedCharacter[] = [];
    const errors: string[] = [];

    // 发送进度更新的辅助函数
    const sendProgress = (data: {
      step: string;
      message: string;
      progress: number;
      currentCharacter?: number;
      totalCharacters?: number;
    }) => {
      if (onProgress) {
        onProgress(data);
      }
    };

    try {
      const totalImages = characterImages.length;

      if (totalImages === 0) {
        return {
          characters: [],
          analysisResults: [],
          success: true,
          errors: ["没有提供角色图片"],
        };
      }

      // 步骤1：分析所有角色照片
      sendProgress({
        step: "analyzing",
        message: `开始分析 ${totalImages} 张角色照片...`,
        progress: 5,
        totalCharacters: totalImages,
      });

      for (let i = 0; i < totalImages; i++) {
        const image = characterImages[i];

        if (
          image.type === "file" &&
          image.mediaType.includes("image/") &&
          image.url
        ) {
          try {
            sendProgress({
              step: "analyzing",
              message: `正在分析第 ${i + 1} 张照片...`,
              progress: 5 + (i * 20) / totalImages,
              currentCharacter: i + 1,
              totalCharacters: totalImages,
            });

            // 分析图片中的角色特征
            const tags = await faceAnalysisService.analyzeFaceFromBase64(
              `data:image/jpeg;base64,${image.url}`,
              { temperature: 0.3 }
            );

            const analysisResult: CharacterAnalysisResult = {
              id: `char_${Date.now()}_${i}`,
              originalImageUrl: `data:image/jpeg;base64,${image.url}`,
              tags,
              description: this.generateCharacterDescription(tags),
              confidence: this.calculateConfidence(tags),
            };

            analysisResults.push(analysisResult);

            sendProgress({
              step: "analyzing",
              message: `第 ${i + 1} 张照片分析完成，识别到 ${
                tags.length
              } 个特征`,
              progress: 5 + ((i + 1) * 20) / totalImages,
              currentCharacter: i + 1,
              totalCharacters: totalImages,
            });
          } catch (error) {
            const errorMsg = `分析第 ${i + 1} 张照片失败: ${
              error instanceof Error ? error.message : "未知错误"
            }`;
            errors.push(errorMsg);
            console.error(errorMsg, error);
          }
        } else {
          errors.push(`第 ${i + 1} 张图片格式不支持`);
        }
      }

      // 步骤2：基于分析结果生成角色
      if (analysisResults.length === 0) {
        return {
          characters: [],
          analysisResults: [],
          success: false,
          errors: ["没有成功分析的角色照片"],
        };
      }

      sendProgress({
        step: "generating",
        message: `开始生成 ${analysisResults.length} 个${artStyle}风格角色...`,
        progress: 25,
        totalCharacters: analysisResults.length,
      });

      for (let i = 0; i < analysisResults.length; i++) {
        const analysis = analysisResults[i];

        try {
          sendProgress({
            step: "generating",
            message: `正在生成第 ${i + 1} 个角色...`,
            progress: 25 + (i * 60) / analysisResults.length,
            currentCharacter: i + 1,
            totalCharacters: analysisResults.length,
          });

          // 构建角色生成提示词
          const characterPrompt = this.buildCharacterPrompt(analysis, artStyle);

          // 准备输入图片
          const inputImage: GeminiImageInput = {
            data: analysis.originalImageUrl.split(",")[1], // 去掉data:image/jpeg;base64,前缀
            mimeType: "image/jpeg",
          };

          // 使用Gemini生成角色图片
          const characterResult = await geminiImageService.generateImage({
            prompt: characterPrompt,
            inputImages: [inputImage],
            userId,
          });

          const generatedCharacter: GeneratedCharacter = {
            id: analysis.id,
            name: `角色${i + 1}`,
            description: analysis.description,
            imageUrl: characterResult.imageUrl,
            tags: analysis.tags,
            originalImageUrl: analysis.originalImageUrl,
            artStyle,
            generatedAt: new Date().toISOString(),
          };

          generatedCharacters.push(generatedCharacter);

          sendProgress({
            step: "generating",
            message: `第 ${i + 1} 个角色生成完成`,
            progress: 25 + ((i + 1) * 60) / analysisResults.length,
            currentCharacter: i + 1,
            totalCharacters: analysisResults.length,
          });
        } catch (error) {
          const errorMsg = `生成第 ${i + 1} 个角色失败: ${
            error instanceof Error ? error.message : "未知错误"
          }`;
          errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }

      sendProgress({
        step: "completed",
        message: `角色生成完成！成功生成 ${generatedCharacters.length} 个角色`,
        progress: 100,
      });

      return {
        characters: generatedCharacters,
        analysisResults,
        success: generatedCharacters.length > 0,
        errors,
      };
    } catch (error) {
      const errorMsg = `角色生成过程失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`;
      errors.push(errorMsg);
      console.error(errorMsg, error);

      return {
        characters: generatedCharacters,
        analysisResults,
        success: false,
        errors,
      };
    }
  }

  /**
   * 基于标签生成角色描述
   */
  private generateCharacterDescription(tags: string[]): string {
    // 分类标签
    const characterTypes = tags.filter((tag) =>
      [
        "young_girl",
        "old_man",
        "little_boy",
        "teenage_girl",
        "woman",
        "man",
        "child",
        "adult",
      ].some((type) => tag.toLowerCase().includes(type))
    );

    const hairStyles = tags.filter((tag) =>
      [
        "long_hair",
        "short_hair",
        "curly_hair",
        "straight_hair",
        "ponytail",
        "braids",
        "bun",
      ].some((style) => tag.toLowerCase().includes(style))
    );

    const facialFeatures = tags.filter((tag) =>
      [
        "big_eyes",
        "small_nose",
        "round_face",
        "square_jaw",
        "thick_eyebrows",
        "dimples",
      ].some((feature) => tag.toLowerCase().includes(feature))
    );

    const accessories = tags.filter((tag) =>
      ["glasses", "hat", "cap", "earrings", "headband"].some((accessory) =>
        tag.toLowerCase().includes(accessory)
      )
    );

    // 构建描述
    let description = "";

    if (characterTypes.length > 0) {
      description += characterTypes[0].replace(/_/g, " ");
    } else {
      description += "person";
    }

    if (hairStyles.length > 0) {
      description += ` with ${hairStyles[0].replace(/_/g, " ")}`;
    }

    if (facialFeatures.length > 0) {
      description += `, ${facialFeatures
        .slice(0, 2)
        .join(" and ")
        .replace(/_/g, " ")}`;
    }

    if (accessories.length > 0) {
      description += `, wearing ${accessories[0].replace(/_/g, " ")}`;
    }

    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  /**
   * 计算分析结果的置信度
   */
  private calculateConfidence(tags: string[]): number {
    // 基于标签数量和质量计算置信度
    const baseConfidence = Math.min(tags.length * 10, 80); // 每个标签10分，最多80分
    const qualityBonus = this.hasHighQualityTags(tags) ? 20 : 0; // 高质量标签额外20分

    return Math.min(baseConfidence + qualityBonus, 100);
  }

  /**
   * 检查是否包含高质量标签
   */
  private hasHighQualityTags(tags: string[]): boolean {
    const highQualityIndicators = [
      "face",
      "eyes",
      "hair",
      "smile",
      "expression",
      "young",
      "old",
      "man",
      "woman",
      "girl",
      "boy",
    ];

    return tags.some((tag) =>
      highQualityIndicators.some((indicator) =>
        tag.toLowerCase().includes(indicator)
      )
    );
  }

  /**
   * 构建角色生成提示词
   */
  private buildCharacterPrompt(
    analysis: CharacterAnalysisResult,
    artStyle: string
  ): string {
    const styleMap: Record<string, string> = {
      cute: "kawaii cute anime style with soft colors and rounded features",
      realistic: "realistic detailed style with natural proportions",
      minimal: "simple minimalist style with clean lines",
      kawaii: "kawaii cute style with big eyes and adorable features",
      ghibli: "Studio Ghibli anime style with detailed backgrounds",
      comic: "comic book style with bold lines and vibrant colors",
      cartoon: "cartoon style with exaggerated features",
      chibi: "chibi style with super deformed proportions",
    };

    const style = styleMap[artStyle] || `${artStyle} style`;
    const features = analysis.tags.slice(0, 5).join(", ").replace(/_/g, " ");

    return `Create a ${style} character illustration based on this reference image. The character should be: ${analysis.description}. Key features: ${features}. Make it a full-body character design with consistent features that can be used across multiple comic panels. Clean background, high quality artwork.`;
  }

  /**
   * 验证生成的角色质量
   */
  validateCharacterQuality(character: GeneratedCharacter): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查必要字段
    if (!character.imageUrl) {
      issues.push("缺少角色图片");
      score -= 30;
    }

    if (!character.description || character.description.length < 10) {
      issues.push("角色描述过短");
      score -= 20;
    }

    if (character.tags.length < 3) {
      issues.push("角色特征标签过少");
      score -= 15;
    }

    // 检查置信度
    const analysisResult = character as unknown as CharacterAnalysisResult; // 类型转换以访问confidence
    if (analysisResult.confidence && analysisResult.confidence < 60) {
      issues.push("角色分析置信度较低");
      score -= 25;
    }

    return {
      isValid: issues.length === 0 || score >= 60,
      issues,
      score: Math.max(score, 0),
    };
  }

  /**
   * 根据场景内容推荐合适的角色
   */
  recommendCharactersForScene(
    sceneDescription: string,
    availableCharacters: GeneratedCharacter[]
  ): {
    characterId: string;
    relevanceScore: number;
    reasoning: string;
  }[] {
    return availableCharacters
      .map((character) => {
        const score = this.calculateRelevanceScore(sceneDescription, character);
        return {
          characterId: character.id,
          relevanceScore: score,
          reasoning: this.generateRelevanceReasoning(
            sceneDescription,
            character,
            score
          ),
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * 计算角色与场景的相关性分数
   */
  private calculateRelevanceScore(
    sceneDescription: string,
    character: GeneratedCharacter
  ): number {
    const sceneWords = sceneDescription.toLowerCase().split(/\s+/);
    const characterWords = [
      ...character.description.toLowerCase().split(/\s+/),
      ...character.tags
        .map((tag) => tag.toLowerCase().replace(/_/g, " "))
        .join(" ")
        .split(/\s+/),
    ];

    // 计算词汇重叠度
    const overlap = sceneWords.filter((word) =>
      characterWords.some(
        (charWord) => word.includes(charWord) || charWord.includes(word)
      )
    ).length;

    // 基础分数
    const baseScore = (overlap / sceneWords.length) * 100;

    // 根据角色类型调整分数
    let typeBonus = 0;
    if (
      character.tags.some(
        (tag) => tag.includes("child") || tag.includes("young")
      )
    ) {
      if (
        sceneDescription.includes("play") ||
        sceneDescription.includes("school")
      ) {
        typeBonus += 20;
      }
    }

    return Math.min(baseScore + typeBonus, 100);
  }

  /**
   * 生成相关性推理说明
   */
  private generateRelevanceReasoning(
    sceneDescription: string,
    character: GeneratedCharacter,
    score: number
  ): string {
    if (score > 70) {
      return `角色特征与场景高度匹配：${character.description}`;
    } else if (score > 40) {
      return `角色特征与场景部分匹配：${character.description}`;
    } else {
      return `角色特征与场景匹配度较低，但可以作为背景角色`;
    }
  }
}

// 创建单例实例
export const characterManagementService = new CharacterManagementService();
