import { ComicScene } from "@/types/diary";
import { storyExpansionWithCharactersService } from "./story-expansion-with-characters.service";
import { comicDatabaseService } from "./comic-database.service";
import { creditService } from "./credit.service";
import { geminiImageService, GeminiImageInput } from "./gemini-image.service";
import {
  characterManagementService,
  GeneratedCharacter,
} from "./character-management.service";
import { UIDataTypes, UIMessagePart, UITools } from "ai";

// 重新导出角色相关接口，保持向后兼容
export type { GeneratedCharacter } from "./character-management.service";

export interface SceneCharacterMapping {
  sceneIndex: number;
  characterIds: string[];
}

// 增强版选项接口
export interface FivePageComicWithCharactersOptions {
  userId: string;
  story: string;
  artStyle: string;
  characterImages?: UIMessagePart<UIDataTypes, UITools>[]; // 用户提供的角色照片
  updateProgress?: (data: {
    type: string;
    message: string;
    progress: number;
    step?: string;
    currentScene?: number;
    totalScenes?: number;
    characters?: GeneratedCharacter[];
    characterMappings?: SceneCharacterMapping[];
  }) => void;
}

// 增强版结果接口
export interface FivePageComicWithCharactersResult {
  comic_id: string;
  scenes: ComicScene[];
  title: string;
  characters: GeneratedCharacter[];
  characterMappings: SceneCharacterMapping[];
  status: "completed" | "failed";
}

export class FivePageComicWithCharactersService {
  /**
   * 生成带角色的完整5页漫画
   */
  async generateFivePageComicWithCharacters(
    options: FivePageComicWithCharactersOptions
  ): Promise<FivePageComicWithCharactersResult> {
    const {
      userId,
      story,
      artStyle,
      characterImages = [],
      updateProgress,
    } = options;

    // Helper function to send progress updates
    const sendProgress = (data: {
      step: string;
      message: string;
      progress: number;
      currentScene?: number;
      totalScenes?: number;
      characters?: GeneratedCharacter[];
      characterMappings?: SceneCharacterMapping[];
    }) => {
      if (updateProgress) {
        updateProgress({
          type: "progress",
          ...data,
        });
      }
    };

    try {
      // 步骤1：检查用户credits
      const totalCreditCost = 0; // TODO: 根据实际需求设置费用

      sendProgress({
        step: "checking",
        message: "正在检查用户余额...",
        progress: 2,
      });

      // 步骤2：分析和生成角色
      let generatedCharacters: GeneratedCharacter[] = [];

      if (characterImages.length > 0) {
        sendProgress({
          step: "processing_characters",
          message: `正在处理 ${characterImages.length} 张角色照片...`,
          progress: 5,
        });

        // 使用角色管理服务处理角色
        const characterResult =
          await characterManagementService.analyzeAndGenerateCharacters({
            userId,
            artStyle,
            characterImages,
            onProgress: (data) => {
              sendProgress({
                step: "processing_characters",
                message: data.message,
                progress: 5 + data.progress * 0.2, // 将角色处理进度映射到5-25%
                currentScene: data.currentCharacter,
                totalScenes: data.totalCharacters,
              });
            },
          });

        if (!characterResult.success) {
          console.warn("角色生成部分失败:", characterResult.errors);
        }

        generatedCharacters = characterResult.characters;

        sendProgress({
          step: "processing_characters",
          message: `角色处理完成，成功生成 ${generatedCharacters.length} 个角色`,
          progress: 25,
          characters: generatedCharacters,
        });
      }

      // 步骤3：故事扩展，包含角色信息
      sendProgress({
        step: "expanding_with_characters",
        message: "正在将故事扩展为5页场景并分配角色...",
        progress: 30,
      });

      // 准备角色信息给故事扩展服务
      const charactersForExpansion = generatedCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        description: char.description,
        tags: char.tags,
      }));

      const expansionResult =
        await storyExpansionWithCharactersService.expandToFivePagesWithCharacters(
          {
            story,
            style: artStyle,
            characters: charactersForExpansion,
          }
        );

      sendProgress({
        step: "expanding_with_characters",
        message: "故事扩展完成，角色分配已确定",
        progress: 40,
        characterMappings: expansionResult.characterMappings,
      });

      // 步骤4：创建漫画记录
      sendProgress({
        step: "creating",
        message: "正在创建漫画记录...",
        progress: 45,
      });

      const comicId = await comicDatabaseService.createComic({
        userId,
        title: expansionResult.title,
        content: story,
        style: artStyle,
      });

      // 步骤5：生成5页场景，使用角色图片
      const scenes: ComicScene[] = [];
      const totalScenes = expansionResult.scenes.length;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = expansionResult.scenes[i];
        const sceneCharacters = this.getSceneCharacters(
          i,
          expansionResult.characterMappings,
          generatedCharacters
        );
        const currentProgress = 50 + i * 8; // 从50%开始，每页占8%进度

        sendProgress({
          step: "generating_scenes",
          message: `正在生成第${i + 1}页：${sceneData.title}...`,
          progress: currentProgress,
          currentScene: i + 1,
          totalScenes,
        });

        // 创建场景记录
        const scene = await comicDatabaseService.createScene({
          comicId,
          sceneOrder: i + 1,
          content: `${sceneData.title}: ${sceneData.description}`,
          description: sceneData.description,
          quote: sceneData.quote,
        });

        // 生成场景图片（使用角色图片作为输入）
        sendProgress({
          step: "generating_scenes",
          message: `正在为第${i + 1}页生成图片...`,
          progress: currentProgress + 4,
          currentScene: i + 1,
          totalScenes,
        });

        // 准备输入图片（角色图片）
        const inputImages: GeminiImageInput[] =
          await this.prepareCharacterImages(sceneCharacters);

        // 构建场景提示词
        const scenePrompt = this.buildScenePrompt(
          sceneData,
          sceneCharacters,
          artStyle
        );

        const imageResult = await geminiImageService.generateImage({
          prompt: scenePrompt,
          inputImages,
          userId,
          sceneId: scene.id,
        });

        // 更新场景图片信息
        const updatedScene = await comicDatabaseService.updateSceneImage(
          scene.id,
          imageResult.imageUrl,
          imageResult.prompt
        );

        // 添加场景到漫画
        await comicDatabaseService.addSceneToComic(comicId, scene.id);

        scenes.push(updatedScene);

        sendProgress({
          step: "generating_scenes",
          message: `第${i + 1}页完成！`,
          progress: currentProgress + 8,
          currentScene: i + 1,
          totalScenes,
        });
      }

      // 步骤6：扣减用户credits
      sendProgress({
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 95,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: totalCreditCost,
        description: `生成带角色的5页漫画 - ${expansionResult.title}`,
        relatedEntityType: "comic",
        relatedEntityId: comicId,
        metadata: {
          comic_id: comicId,
          total_pages: 5,
          style: artStyle,
          original_story: story,
          character_count: generatedCharacters.length,
        },
      });

      if (!deductionResult.success) {
        console.error("扣减credits失败:", deductionResult.message);
      }

      // 步骤7：完成漫画生成
      sendProgress({
        step: "completed",
        message: "带角色的5页漫画生成完成！",
        progress: 100,
        characters: generatedCharacters,
        characterMappings: expansionResult.characterMappings,
      });

      // 标记漫画为完成状态
      await comicDatabaseService.completeComic(comicId);

      return {
        comic_id: comicId,
        scenes,
        title: expansionResult.title,
        characters: generatedCharacters,
        characterMappings: expansionResult.characterMappings,
        status: "completed",
      };
    } catch (error) {
      console.error("带角色的5页漫画生成失败:", error);

      // 发送错误进度更新
      sendProgress({
        step: "error",
        message: `生成失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        progress: 0,
      });

      throw error;
    }
  }

  /**
   * 获取指定场景的角色
   */
  private getSceneCharacters(
    sceneIndex: number,
    mappings: SceneCharacterMapping[],
    characters: GeneratedCharacter[]
  ): GeneratedCharacter[] {
    const mapping = mappings.find((m) => m.sceneIndex === sceneIndex);
    if (!mapping) return [];

    return mapping.characterIds
      .map((id) => characters.find((char) => char.id === id))
      .filter((char) => char !== undefined) as GeneratedCharacter[];
  }

  /**
   * 准备角色图片作为Gemini输入
   */
  private async prepareCharacterImages(
    characters: GeneratedCharacter[]
  ): Promise<GeminiImageInput[]> {
    const inputImages: GeminiImageInput[] = [];

    for (const character of characters) {
      try {
        if (character.imageUrl.includes("base64,")) {
          // 如果是base64图片
          inputImages.push({
            data: character.imageUrl.split("base64,")[1],
            mimeType: "image/jpeg",
          });
        } else {
          // 如果是URL，需要下载并转换为base64
          // 这里可以添加URL转base64的逻辑
          console.warn(`跳过URL图片: ${character.imageUrl}`);
        }
      } catch (error) {
        console.error(`准备角色图片失败: ${character.id}`, error);
      }
    }

    return inputImages;
  }

  /**
   * 构建场景提示词
   */
  private buildScenePrompt(
    sceneData: {
      title: string;
      description: string;
      quote: string;
      visualElements?: string;
      characters?: string[];
    },
    sceneCharacters: GeneratedCharacter[],
    artStyle: string
  ): string {
    const styleMap: Record<string, string> = {
      cute: "kawaii cute anime style",
      realistic: "realistic detailed style",
      minimal: "simple minimalist style",
      kawaii: "kawaii cute style",
      ghibli: "Studio Ghibli anime style",
      comic: "comic book style",
      cartoon: "cartoon style",
    };

    const style = styleMap[artStyle] || artStyle;
    const characterDesc =
      sceneCharacters.length > 0
        ? `featuring these characters: ${sceneCharacters
            .map((char) => char.description)
            .join(", ")}`
        : "";

    return `Create a ${style} comic panel scene: ${sceneData.description}. ${characterDesc}. The scene should be visually engaging and match the art style. Include the quote: "${sceneData.quote}". Make sure the characters are consistent with the reference images provided. Comic panel layout with speech bubbles if needed.`;
  }

  /**
   * 验证生成结果的质量
   */
  validateResult(result: FivePageComicWithCharactersResult): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查基本结构
    if (!result.comic_id) {
      issues.push("缺少漫画ID");
      score -= 30;
    }

    if (!result.scenes || result.scenes.length !== 5) {
      issues.push("场景数量不正确");
      score -= 25;
    }

    if (!result.title) {
      issues.push("缺少漫画标题");
      score -= 10;
    }

    // 检查角色质量
    if (result.characters.length === 0) {
      issues.push("没有生成角色");
      score -= 20;
    } else {
      const invalidCharacters = result.characters.filter(
        (char) => !char.imageUrl
      );
      if (invalidCharacters.length > 0) {
        issues.push(`${invalidCharacters.length} 个角色缺少图片`);
        score -= invalidCharacters.length * 10;
      }
    }

    // 检查场景质量
    const scenesWithoutImages = result.scenes.filter(
      (scene) => !scene.image_url
    );
    if (scenesWithoutImages.length > 0) {
      issues.push(`${scenesWithoutImages.length} 个场景缺少图片`);
      score -= scenesWithoutImages.length * 15;
    }

    return {
      isValid: issues.length === 0 || score >= 60,
      issues,
      score: Math.max(score, 0),
    };
  }
}

// 创建单例实例
export const fivePageComicWithCharactersService =
  new FivePageComicWithCharactersService();
