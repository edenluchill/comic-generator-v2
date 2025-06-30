import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import {
  StableDiffusionConfig,
  GenerationResult,
  StabilityAIError,
  SketchWithStructureOptions,
} from "@/types/stable-diffusion";

export class StableDiffusionImageGenerator {
  private baseUrl: string = "https://api.stability.ai/v2beta";
  private apiKey: string;

  constructor(config: StableDiffusionConfig) {
    this.apiKey = config.apiKey;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * 根据风格生成简笔画提示词
   */
  private generateSketchPrompt(originalPrompt: string, style: string): string {
    const stylePrompts = {
      simple:
        "simple line art, minimalist sketch, clean black lines on white background, basic shapes",
      detailed:
        "detailed pencil sketch, fine line art, artistic drawing with shading, black and white illustration",
      cute: "cute kawaii style sketch, adorable cartoon drawing, simple and sweet line art, chibi style",
    };

    const basePrompt =
      stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.simple;
    return `${basePrompt}, ${originalPrompt}, monochrome sketch, line drawing, no color, white background`;
  }

  /**
   * 将base64转换为Buffer
   */
  private base64ToBuffer(base64String: string): Buffer {
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
    return Buffer.from(base64Data, "base64");
  }

  /**
   * 使用草图控制生成简笔画角色
   */
  async generateSketchWithStructure(
    options: SketchWithStructureOptions
  ): Promise<GenerationResult> {
    if (!this.apiKey) {
      throw new Error("Stability AI API密钥未配置");
    }

    try {
      const prompt = this.generateSketchPrompt(options.prompt, options.style);
      const imageBuffer = this.base64ToBuffer(options.image);

      // 创建 FormData 并正确添加字段
      const formData = new FormData();
      formData.append("image", imageBuffer, {
        filename: "image.png",
        contentType: "image/png",
      });
      formData.append("prompt", prompt);
      formData.append(
        "control_strength",
        (options.controlStrength || 0.7).toString()
      );
      formData.append("output_format", "png");

      const response: AxiosResponse<ArrayBuffer> = await axios.post(
        `${this.baseUrl}/stable-image/control/sketch`,
        formData,
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "image/*",
            ...formData.getHeaders(), // 获取正确的 Content-Type headers
          },
        }
      );

      if (response.status !== 200) {
        let errorMessage = `生成API请求失败: ${response.status}`;
        try {
          const errorData: StabilityAIError = JSON.parse(
            response.data.toString()
          );
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.map((e) => e.message).join(", ");
          }
        } catch {
          // 如果无法解析错误JSON，使用默认错误信息
        }
        throw new Error(errorMessage);
      }

      // 返回生成的图片
      const base64Image = Buffer.from(response.data).toString("base64");
      const generatedImageUrl = `data:image/png;base64,${base64Image}`;

      return {
        imageUrl: generatedImageUrl,
        prompt: prompt,
        style: options.style,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("生成草图控制简笔画失败:", error);
      throw new Error(
        error instanceof Error
          ? `生成失败: ${error.message}`
          : "生成草图控制简笔画时发生未知错误"
      );
    }
  }
}

// 创建单例实例
let generatorInstance: StableDiffusionImageGenerator | null = null;

export function createStableDiffusionGenerator(): StableDiffusionImageGenerator {
  if (!generatorInstance) {
    generatorInstance = new StableDiffusionImageGenerator({
      apiKey: "sk-NHSw3GQT40Rdhxh26GwZjKUlfOTlnnv5bG657Zq7OOamehzK",
      baseUrl: process.env.STABILITY_AI_BASE_URL,
    });
  }

  return generatorInstance;
}
