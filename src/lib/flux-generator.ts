import axios, { AxiosResponse } from "axios";
import {
  FluxConfig,
  FluxGenerationOptions,
  FluxGenerationResult,
  FluxAPIResponse,
} from "@/types/flux";

export class FluxCharacterGenerator {
  private baseUrl: string = "https://api.bfl.ai/v1";
  private apiKey: string;

  constructor(config: FluxConfig) {
    this.apiKey = config.apiKey;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * 生成卡通头像的提示词
   */
  private generateCartoonAvatarPrompt(tags?: string[]): string {
    // 精简的基本prompt
    const featureResult = this.generateFeaturePromptsFromTags(tags);
    const finalPrompt =
      `Convert the ${featureResult.type} into cute hand draw line art of simple chibi avatar with minimal color, minimal brown and white pen drawing,` +
      `make the avatar faced and looked to the front, simple hairstyle with 5-7 curved lines, preserve same cloth in simple style,` +
      ` 2 dot eyes, simple curved smile mouth, blush on cheeks, no shading no shadow no lighting,` +
      `rice-white background,` +
      `other features: ${featureResult.featurePrompts.join(", ")}`;

    // 获取特色描述
    return finalPrompt;
  }

  private generateFeaturePromptsFromTags(tags?: string[]) {
    if (!tags || tags.length === 0) {
      return {
        type: "girl",
        featurePrompts: [],
      };
    }

    // 特征映射数组
    const featureMap = [
      {
        keywords: ["glasses"],
        getPrompt(): string {
          return `Put on simple line art glasses as circles/ovals`;
        },
      },
      {
        keywords: ["short_hair"],
        getPrompt(): string {
          return `short hair with few strokes around head`;
        },
      },
      {
        keywords: ["hat", "cap"],
        getPrompt(): string {
          return `hat as simple geometric shape`;
        },
      },
      {
        keywords: ["earrings"],
        getPrompt(): string {
          return `earrings as small simple shapes`;
        },
      },
    ];

    const featurePrompts: string[] = [];

    // 遍历特征映射，检查是否匹配
    featureMap.forEach((feature) => {
      const hasFeature = feature.keywords.some((keyword) =>
        tags.some((tag) => tag.includes(keyword))
      );

      if (hasFeature) {
        featurePrompts.push(feature.getPrompt());
      }
    });

    const styles: string[] = [];
    tags.forEach((tag) => {
      ["tail", "hair"].forEach((keyword) => {
        if (tag.includes(keyword)) {
          styles.push(tag);
        }
      });
    });

    if (styles.length > 0) {
      featurePrompts.push(
        `preserve the ${styles.join(", ")} style from the input image.`
      );
    }

    const type = tags.find(
      (tag) =>
        tag.includes("girl") || tag.includes("woman") || tag.includes("female")
    )
      ? "girl"
      : tags.find(
          (tag) =>
            tag.includes("boy") || tag.includes("man") || tag.includes("male")
        )
      ? "boy"
      : tags.find((tag) => tag.includes("dog"))
      ? "dog"
      : tags.find((tag) => tag.includes("cat"))
      ? "cat"
      : "cute animal";

    return {
      type: type,
      featurePrompts,
    };
  }

  /**
   * 生成3视图角色的提示词
   */
  private generateThreeViewPrompt(originalPrompt?: string): string {
    const basePrompt = `Create 3-view character sheet (front/side/back) of girl from 
    the input image in the same style, consistent character design across all three views`;

    return originalPrompt ? `${basePrompt}, ${originalPrompt}` : basePrompt;
  }

  /**
   * 图片编辑函数 - 使用Flux的imageEdit API
   */
  async imageEdit(
    inputImage: string,
    prompt: string,
    options?: Partial<FluxGenerationOptions>
  ): Promise<FluxGenerationResult> {
    if (!this.apiKey) {
      throw new Error("Flux API密钥未配置");
    }

    try {
      const requestBody = {
        prompt: prompt,
        input_image: inputImage,
        aspect_ratio: options?.aspectRatio || "1:1",
        seed: options?.seed,
        output_format: options?.outputFormat || "png",
        prompt_upsampling: options?.promptUpsampling || false,
        safety_tolerance: options?.safetyTolerance || 2,
        webhook_url: options?.webhookUrl,
        webhook_secret: options?.webhookSecret,
      };

      const response: AxiosResponse<FluxAPIResponse> = await axios.post(
        `${this.baseUrl}/flux-kontext-pro`,
        requestBody,
        {
          headers: {
            "x-key": this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (response.status !== 200) {
        throw new Error(
          `Flux API请求失败: ${response.status} ${response.statusText}`
        );
      }

      const result = response.data;

      return {
        id: result.id,
        status: result.status as
          | "pending"
          | "processing"
          | "Ready"
          | "Error"
          | "Failed",
        pollingUrl: result.polling_url,
        generatedAt: new Date().toISOString(),
        prompt: prompt,
        progress: 0,
      };
    } catch (error) {
      console.error("Flux图片编辑失败:", error);
      throw new Error(
        error instanceof Error
          ? `图片编辑失败: ${error.message}`
          : "Flux图片编辑时发生未知错误"
      );
    }
  }

  /**
   * 第一步：将原图转换成卡通角色正面头像
   */
  async generateCartoonAvatar(
    inputImage: string,
    tags?: string[],
    options?: Partial<FluxGenerationOptions>
  ): Promise<FluxGenerationResult> {
    const prompt = this.generateCartoonAvatarPrompt(tags);
    return this.imageEdit(inputImage, prompt, options);
  }

  /**
   * 第二步：将卡通头像转换成3视图全身图
   */
  async generateThreeViewFromAvatar(
    cartoonAvatarImage: string,
    options?: Partial<FluxGenerationOptions>
  ): Promise<FluxGenerationResult> {
    const prompt = this.generateThreeViewPrompt();
    return this.imageEdit(cartoonAvatarImage, prompt, {
      ...options,
      aspectRatio: "4:3", // 3视图更适合宽一点的比例
    });
  }

  /**
   * 查询生成状态
   */
  async getGenerationStatus(
    taskId: string,
    pollingUrl?: string
  ): Promise<FluxGenerationResult> {
    if (!this.apiKey) {
      throw new Error("Flux API密钥未配置");
    }

    try {
      const url = pollingUrl || `${this.baseUrl}/get_result`;
      const response: AxiosResponse<FluxAPIResponse> = await axios.get(url, {
        headers: {
          "x-key": this.apiKey,
        },
        params: pollingUrl ? undefined : { id: taskId },
      });

      const result = response.data;

      // 计算进度
      let progress = 0;
      switch (result.status) {
        case "pending":
          progress = 10;
          break;
        case "processing":
          progress = 50;
          break;
        case "Ready":
          progress = 100;
          break;
        case "Error":
        case "Failed":
          progress = 0;
          break;
      }

      return {
        id: taskId,
        status: result.status as
          | "pending"
          | "processing"
          | "Ready"
          | "Error"
          | "Failed",
        imageUrl: result.result?.sample,
        generatedAt: new Date().toISOString(),
        progress: progress,
        error: result.error,
      };
    } catch (error) {
      console.error("查询Flux生成状态失败:", error);
      throw new Error(
        error instanceof Error
          ? `查询失败: ${error.message}`
          : "查询Flux生成状态时发生未知错误"
      );
    }
  }

  /**
   * 等待生成完成（带进度回调）
   */
  async waitForCompletion(
    taskId: string,
    pollingUrl?: string,
    onProgress?: (progress: number, status: string) => void,
    maxWaitTime = 300000 // 5分钟超时
  ): Promise<FluxGenerationResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getGenerationStatus(taskId, pollingUrl);

      if (onProgress) {
        onProgress(result.progress || 0, result.status);
      }

      if (result.status === "Ready") {
        return result;
      }

      if (result.status === "Error" || result.status === "Failed") {
        throw new Error(result.error || "生成失败");
      }

      // 等待1秒再次查询
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("生成超时");
  }
}

// 创建单例实例
let fluxGeneratorInstance: FluxCharacterGenerator | null = null;

export function createFluxCharacterGenerator(): FluxCharacterGenerator {
  if (!fluxGeneratorInstance) {
    fluxGeneratorInstance = new FluxCharacterGenerator({
      apiKey: "a8a48be7-d846-4aca-a87d-ee35843ddf62",
      baseUrl: process.env.FLUX_API_BASE_URL,
    });
  }

  return fluxGeneratorInstance;
}
