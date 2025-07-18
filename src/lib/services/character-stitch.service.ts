import { SceneCharacter } from "@/types/diary";
import { Sharp } from "sharp";

export interface StitchOptions {
  characters: SceneCharacter[];
  spacing: number;
  backgroundColor: string;
  direction: "horizontal" | "vertical";
}

export interface StitchResult {
  stitchedImageUrl: string;
  characterPositions: Array<{
    character: SceneCharacter;
    position: "left" | "middle" | "right";
    index: number;
  }>;
}

export class CharacterStitchService {
  /**
   * 横向拼接角色图片
   */
  async stitchCharacters(options: StitchOptions): Promise<StitchResult> {
    const {
      characters,
      spacing = 0,
      backgroundColor = "white",
      direction = "horizontal",
    } = options;

    if (characters.length === 0) {
      throw new Error("No characters provided for stitching");
    }

    // 下载所有角色图片
    const imageBuffers = await this.downloadCharacterImages(characters);

    // 创建拼接图片
    const stitchedImageUrl = await this.createStitchedImage(
      imageBuffers,
      spacing,
      backgroundColor,
      direction
    );

    // 生成角色位置信息
    const characterPositions = this.generateCharacterPositions(characters);

    return {
      stitchedImageUrl,
      characterPositions,
    };
  }

  /**
   * 生成角色位置信息
   */
  private generateCharacterPositions(characters: SceneCharacter[]): Array<{
    character: SceneCharacter;
    position: "left" | "middle" | "right";
    index: number;
  }> {
    return characters.map((character, index) => ({
      character,
      position: this.getCharacterPosition(index, characters.length),
      index,
    }));
  }

  /**
   * 根据索引和总数确定角色位置
   */
  private getCharacterPosition(
    index: number,
    total: number
  ): "left" | "middle" | "right" {
    if (total === 1) return "middle";
    if (index === 0) return "left";
    if (index === total - 1) return "right";
    return "middle";
  }

  /**
   * 下载角色图片
   */
  private async downloadCharacterImages(
    characters: SceneCharacter[]
  ): Promise<Buffer[]> {
    const downloadPromises = characters.map(async (character) => {
      const response = await fetch(character.avatar_url);
      if (!response.ok) {
        throw new Error(
          `Failed to download image for character ${character.name}`
        );
      }
      return Buffer.from(await response.arrayBuffer());
    });

    return Promise.all(downloadPromises);
  }

  /**
   * 创建拼接图片
   */
  private async createStitchedImage(
    imageBuffers: Buffer[],
    spacing: number,
    backgroundColor: string,
    direction: "horizontal" | "vertical"
  ): Promise<string> {
    try {
      // 使用 Sharp 进行图片拼接
      const Sharp = (await import("sharp")).default;

      // 获取所有图片的尺寸
      const images = await Promise.all(
        imageBuffers.map((buffer) => Sharp(buffer).metadata())
      );

      // 计算拼接后的尺寸
      const { width, height } = this.calculateStitchedDimensions(
        images,
        spacing,
        direction
      );

      // 创建背景画布
      const canvas = Sharp({
        create: {
          width,
          height,
          channels: 4,
          background: backgroundColor,
        },
      });

      // 计算每个图片的位置并合成
      const composite = await this.compositeImages(
        canvas,
        imageBuffers,
        images,
        spacing,
        direction
      );

      // 转换为base64
      const outputBuffer = await composite.png().toBuffer();
      return `data:image/png;base64,${outputBuffer.toString("base64")}`;
    } catch (error) {
      console.error("Image stitching failed:", error);
      throw new Error("Failed to stitch character images");
    }
  }

  /**
   * 计算拼接后的尺寸
   */
  private calculateStitchedDimensions(
    images: Array<{ width?: number; height?: number }>,
    spacing: number,
    direction: "horizontal" | "vertical"
  ): { width: number; height: number } {
    if (direction === "horizontal") {
      const width =
        images.reduce((sum, img) => sum + (img.width || 0), 0) +
        spacing * (images.length - 1);
      const height = Math.max(...images.map((img) => img.height || 0));
      return { width, height };
    } else {
      const width = Math.max(...images.map((img) => img.width || 0));
      const height =
        images.reduce((sum, img) => sum + (img.height || 0), 0) +
        spacing * (images.length - 1);
      return { width, height };
    }
  }

  /**
   * 合成图片
   */
  private async compositeImages(
    canvas: Sharp,
    imageBuffers: Buffer[],
    images: Array<{ width?: number; height?: number }>,
    spacing: number,
    direction: "horizontal" | "vertical"
  ): Promise<Sharp> {
    const compositeOperations = [];
    let currentOffset = 0;

    for (let i = 0; i < imageBuffers.length; i++) {
      const buffer = imageBuffers[i];
      const { width = 0, height = 0 } = images[i];

      if (direction === "horizontal") {
        compositeOperations.push({
          input: buffer,
          left: currentOffset,
          top: 0,
        });
        currentOffset += width + spacing;
      } else {
        compositeOperations.push({
          input: buffer,
          left: 0,
          top: currentOffset,
        });
        currentOffset += height + spacing;
      }
    }

    return canvas.composite(compositeOperations);
  }
}

// 创建单例实例
export const characterStitchService = new CharacterStitchService();
