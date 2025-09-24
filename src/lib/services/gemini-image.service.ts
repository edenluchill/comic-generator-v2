import { GoogleGenAI } from "@google/genai";
import { downloadAndStoreImage } from "@/lib/image-storage";
import * as fs from "node:fs";

export interface GeminiImageInput {
  data: string; // base64 image data
  mimeType: string; // e.g., "image/png", "image/jpeg"
}

export interface GeminiImageGenerationOptions {
  prompt: string;
  inputImages: GeminiImageInput[];
  userId?: string;
  sceneId?: string;
  model?: string;
}

export interface GeminiImageResult {
  imageUrl: string;
  prompt: string;
  generatedAt: string;
}

export class GeminiImageService {
  private ai: GoogleGenAI;
  private defaultModel = "gemini-2.5-flash-image-preview";

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      throw new Error(
        "Google GenAI API key is required for Gemini image generation"
      );
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  /**
   * 使用 Gemini Flash Image Preview 生成图片
   * @param options 生成选项
   * @returns 生成的图片结果
   */
  async generateImage(
    options: GeminiImageGenerationOptions
  ): Promise<GeminiImageResult> {
    const {
      prompt,
      inputImages,
      userId,
      sceneId,
      model = this.defaultModel,
    } = options;

    try {
      // 构建 prompt 内容
      const promptContent: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }> = [{ text: prompt }];

      // 添加输入图片
      inputImages.forEach((image) => {
        promptContent.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      });

      console.log(`Generating image with Gemini model: ${model}`);
      console.log(`Input images count: ${inputImages.length}`);

      // 调用 Gemini API
      const response = await this.ai.models.generateContent({
        model,
        contents: promptContent,
      });

      // 查找生成的图片
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) {
        throw new Error("No content generated");
      }

      let generatedImageData: string | null = null;

      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          generatedImageData = part.inlineData.data;
          break;
        }
      }

      if (!generatedImageData) {
        throw new Error("No image data found in response");
      }

      // 保存图片
      let finalImageUrl: string;

      if (userId) {
        // 如果提供了 userId，保存到 Supabase Storage
        const timestamp = Date.now();
        const filename = `comic_scene_${sceneId ?? "unknown"}_${timestamp}.png`;

        // 创建 data URL 用于下载和存储
        const dataUrl = `data:image/png;base64,${generatedImageData}`;

        finalImageUrl = await downloadAndStoreImage(
          dataUrl,
          "generated-images",
          `users/${userId}/comics`,
          filename
        );
      } else {
        // 如果没有 userId，保存到本地临时目录
        const buffer = Buffer.from(generatedImageData, "base64");
        const timestamp = Date.now();
        const filename = `gemini_generated_${timestamp}.png`;
        const localPath = `./public/temp/${filename}`;

        // 确保目录存在
        const dir = "./public/temp";
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(localPath, buffer);
        finalImageUrl = `/temp/${filename}`;
      }

      console.log("Image generated successfully:", finalImageUrl);

      return {
        imageUrl: finalImageUrl,
        prompt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Gemini image generation failed:", error);
      throw new Error(
        error instanceof Error
          ? `Gemini image generation failed: ${error.message}`
          : "Gemini image generation failed with unknown error"
      );
    }
  }

  /**
   * 从文件路径转换为 base64
   * @param filePath 文件路径
   * @returns GeminiImageInput
   */
  static fileToImageInput(filePath: string): GeminiImageInput {
    const imageData = fs.readFileSync(filePath);
    const base64Image = imageData.toString("base64");

    // 根据文件扩展名确定 MIME 类型
    const extension = filePath.toLowerCase().split(".").pop();
    let mimeType = "image/png";

    switch (extension) {
      case "jpg":
      case "jpeg":
        mimeType = "image/jpeg";
        break;
      case "png":
        mimeType = "image/png";
        break;
      case "gif":
        mimeType = "image/gif";
        break;
      case "webp":
        mimeType = "image/webp";
        break;
    }

    return {
      data: base64Image,
      mimeType,
    };
  }

  /**
   * 从 URL 转换为 base64
   * @param imageUrl 图片 URL
   * @returns GeminiImageInput
   */
  static async urlToImageInput(imageUrl: string): Promise<GeminiImageInput> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const contentType = response.headers.get("content-type") || "image/png";

    return {
      data: base64Image,
      mimeType: contentType,
    };
  }

  /**
   * 从 File 对象转换为 base64
   * @param file File 对象
   * @returns GeminiImageInput
   */
  static async fileObjectToImageInput(file: File): Promise<GeminiImageInput> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return {
      data: base64Image,
      mimeType: file.type,
    };
  }

  /**
   * 从 base64 字符串创建 GeminiImageInput
   * @param base64Data base64 数据 (可以带或不带 data:image/... 前缀)
   * @param mimeType MIME 类型，如果 base64Data 包含前缀则可以自动推断
   * @returns GeminiImageInput
   */
  static base64ToImageInput(
    base64Data: string,
    mimeType?: string
  ): GeminiImageInput {
    let data = base64Data;
    let detectedMimeType = mimeType;

    // 如果包含 data: 前缀，提取实际的 base64 数据和 MIME 类型
    if (base64Data.startsWith("data:")) {
      const [prefix, base64] = base64Data.split(",");
      data = base64;

      if (!mimeType) {
        const mimeMatch = prefix.match(/data:([^;]+)/);
        detectedMimeType = mimeMatch ? mimeMatch[1] : "image/png";
      }
    }

    return {
      data,
      mimeType: detectedMimeType || "image/png",
    };
  }
}

// 导出单例实例
export const geminiImageService = new GeminiImageService();
