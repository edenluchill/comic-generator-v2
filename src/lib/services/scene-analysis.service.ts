import OpenAI from "openai";
// import { Character } from "@/types/characters";

const openai = new OpenAI({
  apiKey:
    "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",
});

export interface SceneAnalysisOptions {
  diaryContent: string;
  maxTokens?: number;
  temperature?: number;
}

export interface SceneDescription {
  description: string;
  mood: string; // 场景情绪
  quote: string; // 装逼话，用原语言
}

// 场景分析结果类型
export interface StoryAnalysisResult {
  title: string; // 故事标题
  scene: SceneDescription; // 单个场景
}

export class SceneAnalysisService {
  /**
   * 分析日记内容并生成单个场景，同时生成故事标题和装逼话
   */
  async analyzeScenes(
    options: SceneAnalysisOptions
  ): Promise<StoryAnalysisResult> {
    const { diaryContent, maxTokens = 1000, temperature = 0.7 } = options;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Diary content: ${diaryContent}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_diary_scene",
            description:
              "Analyze diary content and create a single meaningful scene with title and philosophical quote",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description:
                    "Engaging title for the story based on the diary content",
                },
                scene: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                      description:
                        "English scene description suitable for AI image generation, capturing the most important moment",
                    },
                    mood: {
                      type: "string",
                      description:
                        "Overall mood/emotion of the scene (e.g., happy, sad, excited, peaceful, nostalgic, etc.)",
                    },
                    quote: {
                      type: "string",
                      description:
                        "A short sentence or quote in the same language as the original diary content that reflects the scene's essence",
                    },
                  },
                  required: ["description", "mood", "quote"],
                },
              },
              required: ["title", "scene"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "analyze_diary_scene" },
      },
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("场景分析失败：无法获取GPT工具调用响应");
    }

    return this.parseFunctionCallResult(toolCall.function.arguments);
  }

  /**
   * 解析函数调用结果
   */
  private parseFunctionCallResult(
    argumentsString: string
  ): StoryAnalysisResult {
    try {
      const result = JSON.parse(argumentsString);

      if (!result.title || typeof result.title !== "string") {
        throw new Error("场景分析结果格式错误：缺少故事标题");
      }

      if (!result.scene || typeof result.scene !== "object") {
        throw new Error("场景分析结果格式错误：缺少场景信息");
      }

      const scene = result.scene;
      if (!scene.description || !scene.mood || !scene.quote) {
        throw new Error("场景分析结果格式错误：缺少必需字段");
      }

      return {
        title: result.title,
        scene: {
          description: scene.description,
          mood: scene.mood,
          quote: scene.quote,
        },
      };
    } catch (parseError) {
      console.error("函数调用结果解析错误:", parseError);
      throw new Error("场景分析结果格式错误");
    }
  }
}

// 创建单例实例
export const sceneAnalysisService = new SceneAnalysisService();
