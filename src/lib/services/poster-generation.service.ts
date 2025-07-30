import OpenAI from "openai";
import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { downloadAndStoreImage } from "@/lib/image-storage";
import {
  SceneDescription,
  SceneCharacter,
  ComicScene,
  ComicFormat,
  LayoutMode,
} from "@/types/diary";
import { Character } from "@/types/characters";
import { comicDatabaseService } from "./comic-database.service";
import { characterStitchService } from "./character-stitch.service";
import { StreamUtils } from "./stream-utils";
import { creditService } from "./credit.service";
import { CREDIT_COSTS } from "@/types/credits";

const openai = new OpenAI({
  apiKey:
    "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",
});

export interface PosterGenerationOptions {
  userId: string;
  diaryContent: string;
  characters: SceneCharacter[];
  style: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

export interface PosterGenerationResult {
  comic_id: string;
  scenes: ComicScene[];
  status: "completed" | "failed";
}

export interface PosterSceneDescription {
  title: string; // 添加海报标题
  description: string;
  character_ids: string[];
  mood: string;
  visual_theme: string;
  composition_style: string;
}

export class PosterGenerationService {
  private generator = createFluxCharacterGenerator();

  /**
   * 生成单场景海报
   */
  async generateSingleScene(
    options: PosterGenerationOptions
  ): Promise<PosterGenerationResult> {
    const { userId, diaryContent, characters, style, controller, encoder } =
      options;

    try {
      // 步骤0：检查用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "checking",
        message: "正在检查用户余额...",
        progress: 2,
      });

      const creditCheck = await creditService.checkCredits(
        userId,
        CREDIT_COSTS.COMIC_GENERATION
      );

      if (!creditCheck.hasEnoughCredits) {
        throw new Error(
          creditCheck.message ||
            `余额不足，需要 ${CREDIT_COSTS.COMIC_GENERATION} credits，当前只有 ${creditCheck.currentCredits} credits`
        );
      }

      // 步骤1：验证角色信息并创建日记记录
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在验证角色信息...",
        progress: 5,
      });

      const characterData: Character[] = characters.map((c) => ({
        id: c.id,
        name: c.name,
        avatar_url: c.avatar_url,
        three_view_url: c.avatar_url,
        created_at: "",
        user_id: userId,
      }));

      const characterIds = characters.map((c) => c.id);
      const isValidCharacters =
        await comicDatabaseService.validateUserCharacters(userId, characterIds);
      if (!isValidCharacters) {
        throw new Error("角色验证失败，请确保角色属于当前用户");
      }

      // 步骤2：创建日记记录
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在保存日记...",
        progress: 10,
      });

      // 步骤3：生成海报风格的场景描述
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在创建海报概念...",
        progress: 20,
      });

      const posterDescription = await this.generatePosterDescription({
        diaryContent,
        characters: characterData,
      });

      const diary = await comicDatabaseService.createDiary(
        userId,
        diaryContent,
        posterDescription.title
      );

      // 步骤4：创建漫画记录（海报模式）
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_scenes",
        message: "正在创建海报设计...",
        progress: 30,
      });

      const comic = await comicDatabaseService.createComic(
        diary.id,
        userId,
        style,
        "single" as ComicFormat,
        "poster" as LayoutMode,
        posterDescription.title
      );

      // 步骤5：创建场景记录
      const sceneDescriptions: SceneDescription[] = [
        {
          scene_number: 1,
          description: posterDescription.description,
          character_ids: posterDescription.character_ids,
          mood: posterDescription.mood,
        },
      ];

      const scenes = await comicDatabaseService.createScenes(
        comic.id,
        sceneDescriptions,
        characterData
      );

      // 步骤6：生成海报图片
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_images",
        message: "正在生成海报图片...",
        progress: 50,
      });

      const completedScene = await this.generatePosterImage({
        scene: scenes[0],
        posterDescription,
        characters: characterData,
        style,
        userId,
        controller,
        encoder,
      });

      // 步骤7：扣减用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 95,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: CREDIT_COSTS.POSTER_GENERATION,
        description: `生成海报 - ${posterDescription.title || "无标题"}`,
        relatedEntityType: "comic",
        relatedEntityId: comic.id,
        metadata: {
          comic_id: comic.id,
          style: style,
          format: "single",
          layout_mode: "poster",
          visual_theme: posterDescription.visual_theme,
        },
      });

      if (!deductionResult.success) {
        console.error("扣减credits失败:", deductionResult.message);
      }

      // 步骤8：完成海报生成
      StreamUtils.encodeProgress(encoder, controller, {
        step: "completed",
        message: "海报生成完成！",
        progress: 100,
      });

      await comicDatabaseService.completeComic(comic.id, diary.id);

      return {
        comic_id: comic.id,
        scenes: [completedScene],
        status: "completed",
      };
    } catch (error) {
      console.error("海报生成失败:", error);
      throw error;
    }
  }

  /**
   * 生成海报风格的场景描述
   */
  async generatePosterDescription(options: {
    diaryContent: string;
    characters: Character[];
  }): Promise<PosterSceneDescription> {
    const { diaryContent, characters } = options;

    const characterList = characters.map((c) => `${c.name}`).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Create a powerful, impactful poster concept from this diary content that would be perfect for wall art or apparel. Also generate an engaging title for the poster.

Available characters: ${characterList}

Story content: ${diaryContent}

Design a single poster scene that:
1. Has cinematic quality with depth and visual interest
2. When mentioning character names, wrap them with angle brackets like <character_name>
3. Must only use characters that is involved in the story
4. Place shorten key words from the story in the poster with a bold font, to make it more interesting
5. Create a catchy, memorable title that captures the essence of the poster

Consider these poster design principles:
- Bold, eye-catching composition
- Strong contrast and dramatic lighting
- Memorable character expressions and poses
- Visual hierarchy that draws the eye
- Suitable for various display contexts (wall, clothing, etc.)`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_poster_concept",
            description:
              "Create a poster concept with structured information including title",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description:
                    "Catchy, memorable title for the poster that captures its essence",
                },
                description: {
                  type: "string",
                  description:
                    "Detailed poster scene description in English with cinematic and dramatic elements",
                },
                character_ids: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description:
                    "Array of character IDs that appear in the poster",
                },
                mood: {
                  type: "string",
                  description:
                    "Overall mood of the poster (e.g., epic, dramatic, inspiring, mysterious, etc.)",
                },
                visual_theme: {
                  type: "string",
                  description:
                    "Brief theme description (e.g., 'heroic journey', 'romantic sunset', 'mystical adventure')",
                },
                composition_style: {
                  type: "string",
                  description:
                    "Brief composition note (e.g., 'central hero pose', 'dynamic action', 'intimate moment')",
                },
              },
              required: [
                "title",
                "description",
                "character_ids",
                "mood",
                "visual_theme",
                "composition_style",
              ],
            },
          },
        },
      ],
      tool_choice: "required",
      max_tokens: 1000,
      temperature: 0.8, // Higher creativity for poster concepts
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("海报概念生成失败：无法获取GPT函数调用响应");
    }

    try {
      const result = JSON.parse(toolCall.function.arguments);

      if (
        !result.title ||
        !result.description ||
        !result.mood ||
        !result.visual_theme ||
        !result.composition_style
      ) {
        throw new Error("海报概念生成结果格式错误：缺少必需字段");
      }

      // 从描述中提取角色IDs（作为备用，主要使用function返回的character_ids）
      const extractedCharacterIds = this.extractCharacterIds(
        result.description,
        characters
      );

      // 使用function返回的character_ids，如果为空则使用提取的
      const finalCharacterIds =
        result.character_ids && result.character_ids.length > 0
          ? result.character_ids
          : extractedCharacterIds;

      return {
        title: result.title,
        description: result.description,
        character_ids: finalCharacterIds,
        mood: result.mood,
        visual_theme: result.visual_theme,
        composition_style: result.composition_style,
      };
    } catch (parseError) {
      console.error("海报概念解析错误:", parseError);
      throw new Error("海报概念生成结果格式错误");
    }
  }

  /**
   * 生成海报风格的图片
   */
  async generatePosterImage(options: {
    scene: ComicScene;
    posterDescription: PosterSceneDescription;
    characters: Character[];
    style: string;
    userId: string;
    controller: ReadableStreamDefaultController;
    encoder: TextEncoder;
  }): Promise<ComicScene> {
    const {
      scene,
      posterDescription,
      characters,
      style,
      userId,
      controller,
      encoder,
    } = options;

    try {
      // 更新场景状态
      await comicDatabaseService.updateSceneStatus(scene.id, "processing");

      // 找到场景中需要的角色
      const sceneCharacters = characters.filter(
        (c: Character) =>
          posterDescription.character_ids.includes(c.id) ||
          posterDescription.character_ids.includes(c.name)
      );

      // 构建海报专用的prompt
      const posterPrompt = this.buildPosterPrompt(
        posterDescription,
        sceneCharacters,
        style
      );

      // 准备角色参考图片
      const { referenceImage } = await this.prepareReferenceImage(
        sceneCharacters.map((c) => ({
          id: c.id,
          name: c.name,
          avatar_url: c.avatar_url,
        }))
      );

      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_images",
        message: "正在生成海报艺术...",
        progress: 70,
      });

      // 生成海报图片 - 使用适合海报的宽高比
      const imageResult = await this.generator.imageEdit(
        referenceImage,
        posterPrompt,
        {
          aspectRatio: "4:3", // 海报比例，适合打印和展示
          outputFormat: "png",
          width: 1024,
          height: 768,
          promptUpsampling: true,
          safetyTolerance: 2,
        }
      );

      // 等待图片生成完成
      const completedImage = await this.generator.waitForCompletion(
        imageResult.id,
        imageResult.pollingUrl,
        (progress) => {
          StreamUtils.encodeProgress(encoder, controller, {
            step: "generating_images",
            message: `海报生成进度: ${Math.round(progress)}%`,
            progress: 70 + progress * 0.2,
          });
        }
      );

      if (!completedImage.imageUrl) {
        throw new Error("海报图片生成失败：无法获取生成的图片");
      }

      // 保存图片到Supabase Storage
      const storedImageUrl = await downloadAndStoreImage(
        completedImage.imageUrl,
        "generated-images",
        `users/${userId}/posters`,
        `poster_${scene.id}.png`
      );

      // 更新场景记录
      const updatedScene = await comicDatabaseService.updateSceneImage(
        scene.id,
        storedImageUrl,
        posterPrompt
      );

      return updatedScene;
    } catch (error) {
      console.error("海报图片生成失败:", error);
      await comicDatabaseService.markSceneFailed(scene.id, scene.retry_count);
      throw new Error(
        `海报生成失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }

  /**
   * 构建海报专用的prompt
   */
  private buildPosterPrompt(
    posterDescription: PosterSceneDescription,
    characters: Character[],
    style: string
  ): string {
    // 处理角色名字替换
    let processedDescription = posterDescription.description;

    // 生成角色位置标签
    const characterMappings = characters.map((char, index) => ({
      originalName: char.name,
      positionLabel: `person_${index + 1}`,
      character: char,
    }));

    // 替换角色名字
    for (const mapping of characterMappings) {
      const namePattern = new RegExp(`<${mapping.originalName}>`, "g");
      processedDescription = processedDescription.replace(
        namePattern,
        mapping.positionLabel
      );
    }

    // 海报专用的样式增强词
    const posterStyleEnhancers = [
      "cinematic poster composition",
      "dramatic lighting",
      "high contrast",
      "professional poster design",
      "eye-catching visual impact",
      "award-winning poster art",
      "stunning visual storytelling",
      "bold and striking",
      "magazine cover quality",
      "premium wall art aesthetic",
    ];

    const styleMapping: Record<string, string> = {
      cute: "cute anime poster style, kawaii aesthetic, vibrant pastel colors, charming and heartwarming",
      realistic:
        "photorealistic poster style, cinematic realism, dramatic photography lighting",
      cartoon:
        "dynamic cartoon poster style, bold cartoon aesthetics, vivid animated look",
      anime:
        "epic anime poster style, dramatic anime composition, stunning anime art quality",
      watercolor:
        "artistic watercolor poster style, flowing watercolor techniques, artistic poster design",
    };

    const selectedStyle = styleMapping[style] || styleMapping.cute;
    const enhancerPhrase = posterStyleEnhancers.join(", ");

    return [
      processedDescription,
      selectedStyle,
      enhancerPhrase,
      `mood: ${posterDescription.mood}`,
      `visual theme: ${posterDescription.visual_theme}`,
      `composition: ${posterDescription.composition_style}`,
      "perfect for wall display, apparel design, high-quality poster art",
    ].join(", ");
  }

  /**
   * 准备角色参考图片
   */
  private async prepareReferenceImage(
    characters: SceneCharacter[]
  ): Promise<{ referenceImage: string }> {
    if (characters.length === 0) {
      return { referenceImage: "" };
    }

    if (characters.length === 1) {
      return { referenceImage: characters[0].avatar_url };
    }

    // 多个角色时进行拼接
    try {
      const stitchResult = await characterStitchService.stitchCharacters({
        characters,
        spacing: 10,
        backgroundColor: "white",
        direction: "horizontal",
      });

      return { referenceImage: stitchResult.stitchedImageUrl };
    } catch (error) {
      console.error("角色图片拼接失败:", error);
      // 降级到使用第一个角色的图片
      return { referenceImage: characters[0].avatar_url };
    }
  }

  /**
   * 从场景描述中提取角色名并转换为角色IDs
   */
  private extractCharacterIds(
    description: string,
    characters: Character[]
  ): string[] {
    const characterIds: string[] = [];

    for (const character of characters) {
      const namePattern = new RegExp(`<${character.name}>`, "gi");
      if (namePattern.test(description)) {
        characterIds.push(character.id);
      }
    }

    return characterIds;
  }
}

// 创建单例实例
export const posterGenerationService = new PosterGenerationService();
