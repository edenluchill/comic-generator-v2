import { ComicScene } from "@/types/diary";

import { sceneAnalysisService } from "./scene-analysis.service";
import { comicDatabaseService } from "./comic-database.service";
import { sceneImageService } from "./scene-image.service";
import { StreamUtils } from "./stream-utils";
import { creditService } from "./credit.service";
import { CREDIT_COSTS } from "@/types/credits";

export interface ComicGenerationOptions {
  userId: string;
  content: string; // 改为content，不再使用diaryContent
  style: string;
  comicId?: string; // 可选的现有comic ID
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

export interface AddPageOptions {
  userId: string;
  comicId: string;
  pageNumber: number;
  content: string; // 改为content，不再使用diaryContent
  style: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

export interface ComicGenerationResult {
  comic_id: string;
  scene: ComicScene;
  status: "completed" | "failed";
}

export class ComicGenerationService {
  /**
   * 生成单页漫画
   */
  async generateComic(
    options: ComicGenerationOptions
  ): Promise<ComicGenerationResult> {
    const { userId, content, style, comicId, controller, encoder } = options;

    try {
      // 步骤1：检查用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "checking",
        message: "正在检查用户余额...",
        progress: 5,
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

      // 步骤2：分析故事内容，生成单个场景描述
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在分析故事内容...",
        progress: 15,
      });

      const { scene: sceneDescription, title } =
        await sceneAnalysisService.analyzeScenes({
          diaryContent: content, // 传递content作为diaryContent
        });

      let finalComicId = comicId;

      if (!comicId) {
        // 如果没有提供comic_id，创建新的漫画
        // 步骤3：创建漫画记录
        StreamUtils.encodeProgress(encoder, controller, {
          step: "generating_scenes",
          message: "正在创建漫画...",
          progress: 35,
        });

        finalComicId = await comicDatabaseService.createComic({
          userId,
          title,
          content,
          style,
        });
      } else {
        // 如果提供了comic_id，获取现有漫画信息
        const existingComic = await comicDatabaseService.getComicWithScenes(
          comicId
        );
        if (!existingComic) {
          throw new Error("指定的漫画不存在");
        }
        if (existingComic.user_id !== userId) {
          throw new Error("无权限访问此漫画");
        }
      }

      // 步骤4：创建场景记录（先创建空的场景记录）
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_scenes",
        message: "正在创建场景...",
        progress: 45,
      });

      // 获取下一个场景顺序号
      const comic = await comicDatabaseService.getComicWithScenes(
        finalComicId!
      );
      const nextSceneOrder = (comic?.scenes?.length || 0) + 1;

      const scene = await comicDatabaseService.createScene({
        comicId: finalComicId!,
        sceneOrder: nextSceneOrder,
        content: content,
        description: sceneDescription.description,
        mood: sceneDescription.mood,
        quote: sceneDescription.quote,
      });

      // 步骤5：生成场景图片
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating_images",
        message: "正在生成场景图片...",
        progress: 60,
      });

      const imageResult = await sceneImageService.generateSceneImage({
        sceneDescription: sceneDescription.description,
        style,
        userId,
        sceneId: scene.id,
      });

      // 步骤6：更新场景图片信息
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在保存场景图片...",
        progress: 80,
      });

      const updatedScene = await comicDatabaseService.updateSceneImage(
        scene.id,
        imageResult.imageUrl,
        imageResult.imagePrompt
      );

      // 步骤7：更新comic的scene_ids数组
      await comicDatabaseService.addSceneToComic(finalComicId!, scene.id);

      // 步骤8：扣减用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 90,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: CREDIT_COSTS.COMIC_GENERATION,
        description: `生成漫画 - ${title || "无标题"}`,
        relatedEntityType: "comic",
        relatedEntityId: finalComicId!,
        metadata: {
          comic_id: finalComicId!,
          scene_id: scene.id,
          style: style,
        },
      });

      if (!deductionResult.success) {
        // 记录错误但不阻止漫画完成，因为用户已经生成了漫画
        console.error("扣减credits失败:", deductionResult.message);
      }

      // 步骤9：完成漫画生成
      StreamUtils.encodeProgress(encoder, controller, {
        step: "completed",
        message: "漫画生成完成！",
        progress: 100,
      });

      // 标记漫画为完成状态
      await comicDatabaseService.completeComic(finalComicId!);

      return {
        comic_id: finalComicId!,
        scene: updatedScene,
        status: "completed",
      };
    } catch (error) {
      console.error("漫画生成失败:", error);
      throw error;
    }
  }

  /**
   * 添加页面到现有漫画
   */
  async addPageToComic(
    options: AddPageOptions
  ): Promise<ComicGenerationResult> {
    const { userId, comicId, pageNumber, content, style, controller, encoder } =
      options;

    try {
      // 步骤1：检查用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "checking",
        message: "正在检查用户余额...",
        progress: 5,
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

      // 步骤2：分析故事内容，生成场景描述
      StreamUtils.encodeProgress(encoder, controller, {
        step: "analyzing",
        message: "正在分析故事内容...",
        progress: 15,
      });

      const { scene: sceneDescription } =
        await sceneAnalysisService.analyzeScenes({
          diaryContent: content,
        });

      // 步骤3：创建场景记录
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating",
        message: `正在创建第${pageNumber}页...`,
        progress: 35,
      });

      const scene = await comicDatabaseService.createScene({
        comicId,
        sceneOrder: pageNumber,
        content: content,
        description: sceneDescription.description,
        mood: sceneDescription.mood,
      });

      // 步骤4：生成场景图片
      StreamUtils.encodeProgress(encoder, controller, {
        step: "generating",
        message: "正在生成场景图片...",
        progress: 50,
      });

      const imageResult = await sceneImageService.generateSceneImage({
        sceneDescription: sceneDescription.description,
        style: style || "cute",
        userId,
        sceneId: scene.id,
      });

      // 步骤5：更新场景图片信息
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在保存场景图片...",
        progress: 75,
      });

      const updatedScene = await comicDatabaseService.updateSceneImage(
        scene.id,
        imageResult.imageUrl,
        imageResult.imagePrompt
      );

      // 步骤6：更新comic的scene_ids数组
      await comicDatabaseService.addSceneToComic(comicId, scene.id);

      // 步骤7：扣减用户credits
      StreamUtils.encodeProgress(encoder, controller, {
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 85,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: CREDIT_COSTS.COMIC_GENERATION,
        description: `添加漫画页面 - 第${pageNumber}页`,
        relatedEntityType: "comic",
        relatedEntityId: comicId,
        metadata: {
          comic_id: comicId,
          scene_id: scene.id,
          page_number: pageNumber,
        },
      });

      if (!deductionResult.success) {
        console.error("扣减credits失败:", deductionResult.message);
      }

      // 步骤8：完成
      StreamUtils.encodeProgress(encoder, controller, {
        step: "completed",
        message: `第${pageNumber}页添加完成！`,
        progress: 100,
      });

      return {
        comic_id: comicId,
        scene: updatedScene,
        status: "completed",
      };
    } catch (error) {
      console.error("添加漫画页面失败:", error);
      throw error;
    }
  }
}

// 创建单例实例
export const comicGenerationService = new ComicGenerationService();
