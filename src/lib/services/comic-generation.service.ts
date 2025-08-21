import {
  ComicScene,
  SceneDescription,
  SceneCharacter,
  ComicFormat,
} from "@/types/diary";
import { Character } from "@/types/characters";
import { sceneAnalysisService } from "./scene-analysis.service";
import { comicDatabaseService } from "./comic-database.service";
import { sceneImageService } from "./scene-image.service";
import { StreamUtils } from "./stream-utils";
import { creditService } from "./credit.service";
import { CREDIT_COSTS } from "@/types/credits";

export interface ComicGenerationOptions {
  userId: string;
  diaryContent: string;
  characters: SceneCharacter[];
  style: string;
  format: ComicFormat; // 新增
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

export interface ComicGenerationResult {
  comic_id: string;
  scenes: ComicScene[];
  status: "completed" | "failed";
}

export class ComicGenerationService {
  /**
   * 生成完整的漫画
   */
  async generateComic(
    options: ComicGenerationOptions
  ): Promise<ComicGenerationResult> {
    const {
      userId,
      diaryContent,
      characters,
      style,
      format,
      controller,
      encoder,
    } = options;

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

      // 现在直接使用传入的角色信息，转换为Character格式
      const characterData: Character[] = characters.map((c) => ({
        id: c.id,
        name: c.name,
        avatar_url: c.avatar_url,
        three_view_url: c.avatar_url, // 暂时使用avatar_url
        created_at: "",
        user_id: userId,
      }));

      // 可选：验证角色属于用户
      const characterIds = characters.map((c) => c.id);
      const isValidCharacters =
        await comicDatabaseService.validateUserCharacters(userId, characterIds);
      if (!isValidCharacters) {
        throw new Error("角色验证失败，请确保角色属于当前用户");
      }

      // 步骤2：场景分析 - 根据格式决定场景数量
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在分析故事内容...",
        progress: 10,
      });

      const { scenes: sceneDescriptions, title } =
        await sceneAnalysisService.analyzeScenes({
          diaryContent,
          characters: characterData,
        });

      // 步骤3：创建日记记录
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在保存日记...",
        progress: 20,
      });

      const diary = await comicDatabaseService.createDiary(
        userId,
        diaryContent,
        title
      );

      // 步骤4：创建漫画记录
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_scenes",
        message: "正在创建漫画...",
        progress: 30,
      });

      const comic = await comicDatabaseService.createComic(
        diary.id,
        userId,
        style,
        format, // 新增参数
        undefined, // 新增参数
        title // title参数保持可选
      );

      // 步骤5：创建场景记录
      const scenes = await comicDatabaseService.createScenes(
        comic.id,
        sceneDescriptions,
        characterData
      );

      // 步骤6：生成场景图片
      const completedScenes = await this.generateSceneImages(
        scenes,
        sceneDescriptions,
        characterData,
        style,
        userId,
        controller,
        encoder
      );

      // 步骤7：扣减用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 95,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: CREDIT_COSTS.COMIC_GENERATION,
        description: `生成漫画 - ${title || "无标题"}`,
        relatedEntityType: "comic",
        relatedEntityId: comic.id,
        metadata: {
          comic_id: comic.id,
          scenes_count: completedScenes.length,
          style: style,
          format: format, // 新增元数据
        },
      });

      if (!deductionResult.success) {
        // 记录错误但不阻止漫画完成，因为用户已经生成了漫画
        console.error("扣减credits失败:", deductionResult.message);
        // 可以选择在这里添加补偿逻辑，比如将漫画标记为需要补扣credits
      }

      // 步骤8：完成漫画生成
      StreamUtils.encodeProgress(encoder, controller, {
        step: "completed",
        message: "漫画生成完成！",
        progress: 100,
      });

      await comicDatabaseService.completeComic(comic.id, diary.id);

      return {
        comic_id: comic.id,
        scenes: completedScenes,
        status: "completed",
      };
    } catch (error) {
      console.error("漫画生成失败:", error);
      throw error;
    }
  }

  /**
   * 生成所有场景的图片 - 并行版本
   */
  private async generateSceneImages(
    scenes: ComicScene[],
    sceneDescriptions: SceneDescription[],
    characterData: Character[],
    style: string,
    userId: string,
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder
  ): Promise<ComicScene[]> {
    // 发送开始生成消息
    StreamUtils.encodeProgress(encoder, controller, {
      step: "generating_images",
      total_scenes: scenes.length,
      message: `正在并行生成${scenes.length}个场景...`,
      progress: 40,
    });

    // 用于追踪已完成的场景数量
    let completedCount = 0;

    // 创建并行任务
    const generateTasks = scenes.map(async (scene, index) => {
      const sceneDesc = sceneDescriptions[index];

      try {
        // 更新场景状态
        await comicDatabaseService.updateSceneStatus(scene.id, "processing");

        // 找到场景中需要的角色
        const sceneCharacters = characterData.filter((c: Character) =>
          sceneDesc.character_ids.includes(c.id)
        );

        // 生成场景图片（移除进度回调，因为我们将在完成时通知）
        const imageResult = await sceneImageService.generateSceneImage({
          sceneDescription: sceneDesc.description,
          sceneCharacters,
          style,
          userId,
          sceneId: scene.id,
          // 移除 onProgress 回调
        });

        // 更新场景记录
        const updatedScene = await comicDatabaseService.updateSceneImage(
          scene.id,
          imageResult.imageUrl,
          imageResult.imagePrompt
        );

        // 增加完成计数并通知前端
        completedCount++;
        const progressPercentage = 40 + (completedCount / scenes.length) * 50; // 40-90% 的进度区间

        StreamUtils.encodeProgress(encoder, controller, {
          step: "generating_images",
          total_scenes: scenes.length,
          message: `已完成${completedCount}/${scenes.length}个场景`,
          progress: progressPercentage,
        });

        return { success: true, scene: updatedScene, index };
      } catch (sceneError) {
        console.error(`Scene ${index + 1} generation failed:`, {
          sceneId: scene.id,
          error: sceneError,
          retryCount: scene.retry_count,
          sceneDescription: sceneDesc.description.substring(0, 100) + "..."
        });

        // 标记场景为失败状态
        await comicDatabaseService.markSceneFailed(scene.id, scene.retry_count);

        return {
          success: false,
          error: sceneError,
          index,
          sceneId: scene.id,
        };
      }
    });

    // 等待所有任务完成
    const results = await Promise.allSettled(generateTasks);

    // 处理结果
    const completedScenes: (ComicScene | undefined)[] = new Array(
      scenes.length
    );
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const taskResult = result.value;
        if (taskResult.success) {
          completedScenes[taskResult.index] = taskResult.scene;
        } else {
          errors.push(
            `第${taskResult.index + 1}个场景生成失败: ${
              taskResult.error instanceof Error
                ? taskResult.error.message
                : "未知错误"
            }`
          );
        }
      } else {
        errors.push(`第${index + 1}个场景生成失败: ${result.reason}`);
      }
    });

    // 如果有任何失败，抛出错误
    if (errors.length > 0) {
      console.warn("部分场景生成失败:", errors);
      throw new Error(`场景生成失败:\n${errors.join("\n")}`);
    }

    // 确保返回的数组按照原始顺序排列
    const orderedScenes = completedScenes.filter(
      (scene) => scene !== undefined
    );

    if (orderedScenes.length !== scenes.length) {
      throw new Error(
        `场景生成不完整: 预期${scenes.length}个场景，实际完成${orderedScenes.length}个`
      );
    }

    return orderedScenes;
  }
}

// 创建单例实例
export const comicGenerationService = new ComicGenerationService();
