import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { downloadAndStoreImage } from "@/lib/image-storage";
import { SceneCharacter } from "@/types/diary";
import { Character } from "@/types/characters";
import { characterStitchService } from "./character-stitch.service";
import { promptProcessingService } from "./prompt-processing.service";

export interface SceneImageGenerationOptions {
  sceneDescription: string;
  sceneCharacters: SceneCharacter[];
  style: string;
  userId: string;
  sceneId: string;
  onProgress?: (progress: number) => void;
}

export interface SceneImageResult {
  imageUrl: string;
  imagePrompt: string;
  stitchedReferenceUrl?: string;
}

export class SceneImageService {
  private generator = createFluxCharacterGenerator();

  /**
   * 为场景生成图片
   */
  async generateSceneImage(
    options: SceneImageGenerationOptions
  ): Promise<SceneImageResult> {
    const {
      sceneDescription,
      sceneCharacters,
      style,
      userId,
      sceneId,
      onProgress,
    } = options;

    // 步骤1：处理角色名字替换
    const processedPrompt = promptProcessingService.processScenePrompt({
      sceneDescription,
      characters: sceneCharacters,
      style,
    });

    // 步骤2：拼接角色图片
    const { referenceImage, stitchedReferenceUrl } =
      await this.prepareReferenceImage(sceneCharacters);

    // 步骤3：生成图片
    const imageResult = await this.generator.imageEdit(
      referenceImage,
      processedPrompt.processedPrompt,
      {
        aspectRatio: "1:1",
        outputFormat: "png",
        promptUpsampling: true,
        safetyTolerance: 2,
      }
    );

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
      imagePrompt: processedPrompt.processedPrompt,
      stitchedReferenceUrl,
    };
  }

  /**
   * 重试生成场景图片
   */
  async retrySceneImage(
    sceneId: string,
    sceneDescription: string,
    sceneCharacters: SceneCharacter[],
    style: string,
    userId: string
  ): Promise<SceneImageResult> {
    // 使用 processScenePrompt 统一处理角色名字替换
    const processedPrompt = promptProcessingService.processScenePrompt({
      sceneDescription,
      characters: sceneCharacters,
      style,
    });

    // 使用统一的拼接逻辑
    const { referenceImage } = await this.prepareReferenceImage(
      sceneCharacters
    );

    const imageResult = await this.generator.imageEdit(
      referenceImage || "",
      processedPrompt.processedPrompt, // 使用处理后的prompt
      {
        aspectRatio: "1:1",
        outputFormat: "png",
        promptUpsampling: true,
        safetyTolerance: 2,
      }
    );

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
      imagePrompt: processedPrompt.processedPrompt, // 使用处理后的prompt
    };
  }

  /**
   * 构建图片生成prompt
   */
  private buildImagePrompt(
    sceneDescription: string,
    sceneCharacters: Character[],
    style: string
  ): string {
    let imagePrompt = `${style} style comic scene: ${sceneDescription}`;

    if (sceneCharacters.length > 0) {
      const characterDescriptions = sceneCharacters
        .map((c) => `character ${c.name} (reference image provided)`)
        .join(", ");
      imagePrompt += `. Features: ${characterDescriptions}`;
    }

    return imagePrompt;
  }

  // 添加统一的角色拼接方法
  private async prepareReferenceImage(
    characters: SceneCharacter[]
  ): Promise<{ referenceImage: string; stitchedReferenceUrl?: string }> {
    let referenceImage = "";
    let stitchedReferenceUrl: string | undefined;

    if (characters.length === 0) {
      return { referenceImage };
    }

    if (characters.length === 1) {
      referenceImage = characters[0].avatar_url;
    } else {
      const stitchResult = await characterStitchService.stitchCharacters({
        characters,
        spacing: 10,
        backgroundColor: "white",
        direction: "horizontal",
      });
      referenceImage = stitchResult.stitchedImageUrl;
      stitchedReferenceUrl = stitchResult.stitchedImageUrl;
    }

    return { referenceImage, stitchedReferenceUrl };
  }
}

// 创建单例实例
export const sceneImageService = new SceneImageService();
