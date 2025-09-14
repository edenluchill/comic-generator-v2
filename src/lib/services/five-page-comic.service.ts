import { ComicScene } from "@/types/diary";
import { storyExpansionService } from "./story-expansion.service";
import { comicDatabaseService } from "./comic-database.service";
import { sceneImageService } from "./scene-image.service";
import { creditService } from "./credit.service";
// import { CREDIT_COSTS } from "@/types/credits";

export interface FivePageComicOptions {
  userId: string;
  story: string;
  style: string;
  updateProgress?: (data: {
    type: string;
    message: string;
    progress: number;
    step?: string;
    currentScene?: number;
    totalScenes?: number;
  }) => void;
}

export interface FivePageComicResult {
  comic_id: string;
  scenes: ComicScene[];
  title: string;
  status: "completed" | "failed";
}

export class FivePageComicService {
  /**
   * 生成完整的5页漫画
   */
  async generateFivePageComic(
    options: FivePageComicOptions
  ): Promise<FivePageComicResult> {
    const { userId, story, style, updateProgress } = options;

    // Helper function to send progress updates
    const sendProgress = (data: {
      step: string;
      message: string;
      progress: number;
      currentScene?: number;
      totalScenes?: number;
    }) => {
      if (updateProgress) {
        updateProgress({
          type: "progress",
          ...data,
        });
      } else {
        // Fallback to original method
        // StreamUtils.encodeProgress(encoder, controller, data);
      }
    };

    try {
      // 步骤1：检查用户credits (5页漫画需要5倍的credits)
      const totalCreditCost = 0; // TODO: USE CREDIT_COSTS.COMIC_GENERATION * 5;

      sendProgress({
        step: "checking",
        message: "正在检查用户余额...",
        progress: 2,
      });

      const creditCheck = await creditService.checkCredits(
        userId,
        totalCreditCost
      );

      if (!creditCheck.hasEnoughCredits) {
        throw new Error(
          creditCheck.message ||
            `余额不足，需要 ${totalCreditCost} credits，当前只有 ${creditCheck.currentCredits} credits`
        );
      }

      // 步骤2：故事扩展为5页场景
      sendProgress({
        step: "expanding",
        message: "正在将故事扩展为5页场景...",
        progress: 5,
      });

      const expansionResult = await storyExpansionService.expandToFivePages({
        story,
        style,
      });

      // 步骤3：创建漫画记录
      sendProgress({
        step: "creating",
        message: "正在创建漫画记录...",
        progress: 10,
      });

      const comicId = await comicDatabaseService.createComic({
        userId,
        title: expansionResult.title,
        content: story, // 保存原始故事
        style,
      });

      // 步骤4：生成5页场景
      const scenes: ComicScene[] = [];
      const totalScenes = expansionResult.scenes.length;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = expansionResult.scenes[i];
        const currentProgress = 15 + i * 15; // 从15%开始，每页占15%进度

        sendProgress({
          step: "generating",
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
          mood: sceneData.mood,
          quote: sceneData.quote,
        });

        // 生成场景图片
        sendProgress({
          step: "generating",
          message: `正在为第${i + 1}页生成图片...`,
          progress: currentProgress + 7,
          currentScene: i + 1,
          totalScenes,
        });

        const imageResult = await sceneImageService.generateSceneImage({
          sceneDescription: `Draw a ${style} style comic scene, the scene is ${sceneData.description}. Visual elements: ${sceneData.visualElements}`,
          style,
          userId,
          sceneId: scene.id,
        });

        // 更新场景图片信息
        const updatedScene = await comicDatabaseService.updateSceneImage(
          scene.id,
          imageResult.imageUrl,
          imageResult.imagePrompt
        );

        // 添加场景到漫画
        await comicDatabaseService.addSceneToComic(comicId, scene.id);

        scenes.push(updatedScene);

        sendProgress({
          step: "generating",
          message: `第${i + 1}页完成！`,
          progress: currentProgress + 15,
          currentScene: i + 1,
          totalScenes,
        });
      }

      // 步骤5：扣减用户credits
      sendProgress({
        step: "finalizing",
        message: "正在扣减积分...",
        progress: 92,
      });

      const deductionResult = await creditService.deductCredits({
        userId,
        amount: totalCreditCost,
        description: `生成5页漫画 - ${expansionResult.title}`,
        relatedEntityType: "comic",
        relatedEntityId: comicId,
        metadata: {
          comic_id: comicId,
          total_pages: 5,
          style: style,
          original_story: story,
        },
      });

      if (!deductionResult.success) {
        console.error("扣减credits失败:", deductionResult.message);
      }

      // 步骤6：完成漫画生成
      sendProgress({
        step: "completed",
        message: "5页漫画生成完成！",
        progress: 100,
      });

      // 标记漫画为完成状态
      await comicDatabaseService.completeComic(comicId);

      return {
        comic_id: comicId,
        scenes,
        title: expansionResult.title,
        status: "completed",
      };
    } catch (error) {
      console.error("5页漫画生成失败:", error);

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
}

// 创建单例实例
export const fivePageComicService = new FivePageComicService();
