import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { downloadAndStoreImage } from "@/lib/image-storage";

export interface SceneImageGenerationOptions {
  sceneDescription: string;
  style: string;
  userId: string;
  sceneId: string;
  onProgress?: (progress: number) => void;
}

export interface SceneImageResult {
  imageUrl: string;
  imagePrompt: string;
}

export class SceneImageService {
  private generator = createFluxCharacterGenerator();

  /**
   * 为场景生成图片
   */
  async generateSceneImage(
    options: SceneImageGenerationOptions
  ): Promise<SceneImageResult> {
    const { sceneDescription, style, userId, sceneId, onProgress } = options;

    // 构建完整的提示词
    const fullPrompt = this.buildScenePrompt(sceneDescription, style);

    // 使用 generate 方法生成图片（不需要输入图片）
    const imageResult = await this.generator.generate(fullPrompt, {
      aspectRatio: "1:1",
      outputFormat: "png",
      promptUpsampling: true,
      safetyTolerance: 2,
    });

    // 等待图片生成完成
    const completedImage = await this.generator.waitForCompletion(
      imageResult.id,
      imageResult.pollingUrl,
      onProgress
    );

    if (!completedImage.imageUrl) {
      throw new Error("图片生成失败：无法获取生成的图片");
    }

    // 保存图片到Supabase Storage
    const storedImageUrl = await downloadAndStoreImage(
      completedImage.imageUrl,
      "generated-images",
      `users/${userId}/comics`,
      `comic_scene_${sceneId}.png`
    );

    return {
      imageUrl: storedImageUrl,
      imagePrompt: fullPrompt,
    };
  }

  /**
   * 重试生成场景图片
   */
  async retrySceneImage(
    sceneId: string,
    sceneDescription: string,
    style: string,
    userId: string
  ): Promise<SceneImageResult> {
    // 构建完整的提示词
    const fullPrompt = this.buildScenePrompt(sceneDescription, style);

    const imageResult = await this.generator.generate(fullPrompt, {
      aspectRatio: "1:1",
      outputFormat: "png",
      promptUpsampling: true,
      safetyTolerance: 2,
    });

    const completedImage = await this.generator.waitForCompletion(
      imageResult.id,
      imageResult.pollingUrl
    );

    if (!completedImage.imageUrl) {
      throw new Error("图片重试生成失败");
    }

    const storedImageUrl = await downloadAndStoreImage(
      completedImage.imageUrl,
      "generated-images",
      `users/${userId}/comics`,
      `comic_scene_${sceneId}_retry_${Date.now()}.png`
    );

    return {
      imageUrl: storedImageUrl,
      imagePrompt: fullPrompt,
    };
  }

  /**
   * 构建场景提示词
   */
  private buildScenePrompt(sceneDescription: string, style: string): string {
    // 根据风格添加相应的提示词前缀
    const stylePrompts: Record<string, string> = {
      cute: "cute, kawaii, adorable style, ",
      realistic: "realistic, detailed, high quality, ",
      minimal: "minimal, simple, clean style, ",
      kawaii: "kawaii, cute, Japanese style, ",
    };

    const stylePrefix = stylePrompts[style] || "";

    return `${stylePrefix}${sceneDescription}, high quality, detailed, beautiful composition`;
  }
}

// 创建单例实例
export const sceneImageService = new SceneImageService();
