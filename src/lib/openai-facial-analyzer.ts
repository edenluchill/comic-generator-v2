import OpenAI from "openai";
import {
  OpenAIImageAnalysisOptions,
  OpenAIFacialAnalysis,
} from "@/types/stable-diffusion";

/**
 * OpenAI 面部特征分析器
 * 使用 GPT-4 Vision 进行面部特征分析和 Caricature 描述生成
 */
export class OpenAIFacialAnalyzer {
  private openai: OpenAI;
  private model: string = "gpt-4o";

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 分析面部特征并生成 Caricature 描述
   */
  async analyzeFacialFeatures(
    options: OpenAIImageAnalysisOptions
  ): Promise<OpenAIFacialAnalysis> {
    const startTime = Date.now();

    console.log("🤖 OpenAI 面部分析开始...");
    console.log("📊 分析选项:", {
      imageSize: options.image.length,
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.3,
      includeCaricature: options.includeCaricatureFeatures !== false,
    });

    try {
      const prompt = this.buildAnalysisPrompt(
        options.includeCaricatureFeatures !== false
      );

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: options.image,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.3,
      });

      const rawResponse = response.choices[0]?.message?.content || "";
      const processingTime = Date.now() - startTime;

      console.log("✅ OpenAI 分析完成");
      console.log("⏱️ 处理时间:", processingTime, "ms");
      console.log("📝 OpenAI 原始响应:", rawResponse);

      // 解析响应
      const analysis = this.parseAnalysisResponse(rawResponse);

      console.log("🎯 解析后的分析结果:", analysis);

      return {
        ...analysis,
        rawResponse,
        confidenceScore: this.calculateConfidenceScore(rawResponse),
      };
    } catch (error) {
      console.error("❌ OpenAI 面部分析失败:", error);
      throw new Error(
        error instanceof Error
          ? `OpenAI分析失败: ${error.message}`
          : "OpenAI分析时发生未知错误"
      );
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(includeCaricature: boolean): string {
    const basePrompt = `
请详细分析这张人脸照片的特征。我需要用这些分析结果来生成简笔画风格的 caricature（夸张漫画）。

请按照以下JSON格式返回分析结果：

{
  "overallDescription": "对整张脸的总体描述",
  "facialFeatures": {
    "faceShape": "脸型 (round/oval/square/heart/diamond/long)",
    "eyeShape": "眼型 (round/almond/hooded/upturned/downturned)",
    "eyeSize": "眼睛大小 (large/medium/small)",
    "eyePosition": "眼位 (wide-set/close-set/normal)",
    "noseShape": "鼻型 (straight/curved/button/hooked/wide/narrow)",
    "noseSize": "鼻子大小 (large/medium/small)",
    "mouthShape": "嘴型 (wide/narrow/full/thin/upturned/downturned)",
    "mouthSize": "嘴巴大小 (large/medium/small)",
    "jawline": "下颌线 (strong/soft/angular/rounded)",
    "cheekbones": "颧骨 (high/low/prominent/subtle)",
    "forehead": "额头 (high/low/wide/narrow)",
    "eyebrows": "眉毛 (thick/thin/arched/straight/bushy)",
    "chin": "下巴 (pointed/rounded/square/cleft/strong/weak)"
  },
  "caricatureKeywords": ["适合夸张化的关键特征词汇"],
  "artisticDescriptions": ["适合艺术创作的描述性词汇"]
}

${
  includeCaricature
    ? `
特别注意：
1. 识别最突出、最适合夸张化的面部特征
2. 提供具体的艺术描述词汇，适合用于 AI 绘画提示词
3. 考虑 caricature 风格的表现方式
4. 关注比例关系和独特性
`
    : ""
}

请确保返回的是有效的JSON格式，不要包含任何额外的文本。
`;

    return basePrompt.trim();
  }

  /**
   * 解析 OpenAI 响应
   */
  private parseAnalysisResponse(
    response: string
  ): Omit<OpenAIFacialAnalysis, "rawResponse" | "confidenceScore"> {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("未找到有效的JSON响应");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // 验证必要字段
      if (!parsed.overallDescription || !parsed.facialFeatures) {
        throw new Error("响应缺少必要字段");
      }

      return {
        overallDescription: parsed.overallDescription || "未提供整体描述",
        facialFeatures: {
          faceShape: parsed.facialFeatures?.faceShape || "未识别",
          eyeShape: parsed.facialFeatures?.eyeShape || "未识别",
          eyeSize: parsed.facialFeatures?.eyeSize || "未识别",
          eyePosition: parsed.facialFeatures?.eyePosition || "未识别",
          noseShape: parsed.facialFeatures?.noseShape || "未识别",
          noseSize: parsed.facialFeatures?.noseSize || "未识别",
          mouthShape: parsed.facialFeatures?.mouthShape || "未识别",
          mouthSize: parsed.facialFeatures?.mouthSize || "未识别",
          jawline: parsed.facialFeatures?.jawline || "未识别",
          cheekbones: parsed.facialFeatures?.cheekbones || "未识别",
          forehead: parsed.facialFeatures?.forehead || "未识别",
          eyebrows: parsed.facialFeatures?.eyebrows || "未识别",
          chin: parsed.facialFeatures?.chin || "未识别",
        },
        caricatureKeywords: parsed.caricatureKeywords || [],
        artisticDescriptions: parsed.artisticDescriptions || [],
      };
    } catch (error) {
      console.error("解析OpenAI响应失败:", error);

      // 返回默认结构
      return {
        overallDescription: "OpenAI响应解析失败，使用默认分析",
        facialFeatures: {
          faceShape: "未识别",
          eyeShape: "未识别",
          eyeSize: "未识别",
          eyePosition: "未识别",
          noseShape: "未识别",
          noseSize: "未识别",
          mouthShape: "未识别",
          mouthSize: "未识别",
          jawline: "未识别",
          cheekbones: "未识别",
          forehead: "未识别",
          eyebrows: "未识别",
          chin: "未识别",
        },
        caricatureKeywords: ["特征分析失败"],
        artisticDescriptions: ["需要手动调整"],
      };
    }
  }

  /**
   * 计算置信度分数
   */
  private calculateConfidenceScore(response: string): number {
    // 简单的置信度计算逻辑
    let score = 0.5; // 基础分数

    // 检查响应长度
    if (response.length > 200) score += 0.2;
    if (response.length > 500) score += 0.1;

    // 检查是否包含详细描述
    const detailKeywords = [
      "prominent",
      "subtle",
      "strong",
      "soft",
      "wide",
      "narrow",
      "large",
      "small",
    ];
    const foundKeywords = detailKeywords.filter((keyword) =>
      response.toLowerCase().includes(keyword)
    ).length;

    score += Math.min(foundKeywords * 0.05, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * 生成 caricature 风格的提示词
   */
  buildCaricaturePrompt(
    analysis: OpenAIFacialAnalysis,
    exaggerationLevel: number = 0.3
  ): string {
    const features = analysis.facialFeatures;
    const keywords = analysis.caricatureKeywords;
    const descriptions = analysis.artisticDescriptions;

    const parts: string[] = [];

    // 基础风格
    parts.push("caricature style", "exaggerated features", "artistic sketch");

    // 面部特征
    if (features.faceShape !== "未识别") {
      parts.push(`${features.faceShape} face shape`);
    }

    // 突出特征
    if (features.eyeSize === "large") {
      parts.push(
        exaggerationLevel > 0.5
          ? "extremely large eyes"
          : "prominently large eyes"
      );
    }
    if (features.noseSize === "large") {
      parts.push(
        exaggerationLevel > 0.5 ? "notably oversized nose" : "prominent nose"
      );
    }

    // 添加关键词
    if (keywords.length > 0) {
      parts.push(...keywords.slice(0, 3)); // 最多3个关键词
    }

    // 添加艺术描述
    if (descriptions.length > 0) {
      parts.push(...descriptions.slice(0, 2)); // 最多2个描述
    }

    console.log("🎨 生成的 Caricature 提示词:", parts.join(", "));

    return parts.join(", ");
  }
}

// 创建单例实例
let analyzerInstance: OpenAIFacialAnalyzer | null = null;

export function createOpenAIFacialAnalyzer(
  apiKey?: string
): OpenAIFacialAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new OpenAIFacialAnalyzer(apiKey);
  }
  return analyzerInstance;
}
