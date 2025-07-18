import OpenAI from "openai";
import { SceneDescription } from "@/types/diary";
import { Character } from "@/types/characters";

const openai = new OpenAI({
  apiKey:
    "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",
});

export interface SceneAnalysisOptions {
  diaryContent: string;
  characters: Character[]; // 完整的角色信息
  maxTokens?: number;
  temperature?: number;
}

export class SceneAnalysisService {
  /**
   * 分析日记内容并切割成4个场景
   */
  async analyzeScenes(
    options: SceneAnalysisOptions
  ): Promise<SceneDescription[]> {
    const {
      diaryContent,
      characters,
      maxTokens = 1000,
      temperature = 0.7,
    } = options;

    const characterList = characters
      .map((c) => `ID: ${c.id}, Name: ${c.name}`)
      .join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze the following diary content and split it into 4 comic scenes. 

Available characters: ${characterList}

Diary content: ${diaryContent}

Please create 4 scenes that:
1. Have clear visual elements suitable for comic panels
2. Are appropriate for single-frame representation
3. Are arranged in chronological order
4. Include emotions and actions
5. Identify the overall mood of each scene
6. When mentioning character names in scene descriptions, wrap them with angle brackets like <character_name>

Use the character IDs (not names) in the character_ids array.`,
        },
      ],
      functions: [
        {
          name: "analyze_diary_scenes",
          description:
            "Split diary content into 4 comic scenes with character assignments and mood analysis",
          parameters: {
            type: "object",
            properties: {
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    scene_number: {
                      type: "integer",
                      description: "Scene number (1-4)",
                    },
                    description: {
                      type: "string",
                      description:
                        "English scene description suitable for AI image generation",
                    },
                    character_ids: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description:
                        "Array of character IDs involved in this scene",
                    },
                    mood: {
                      type: "string",
                      description:
                        "Overall mood/emotion of the scene (e.g., happy, sad, excited, peaceful, etc.)",
                    },
                  },
                  required: [
                    "scene_number",
                    "description",
                    "character_ids",
                    "mood",
                  ],
                },
                minItems: 4,
                maxItems: 4,
              },
            },
            required: ["scenes"],
          },
        },
      ],
      function_call: { name: "analyze_diary_scenes" },
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("场景分析失败：无法获取GPT函数调用响应");
    }

    return this.parseFunctionCallResult(functionCall.arguments);
  }

  /**
   * 解析函数调用结果
   */
  private parseFunctionCallResult(argumentsString: string): SceneDescription[] {
    try {
      const result = JSON.parse(argumentsString);

      if (!result.scenes || !Array.isArray(result.scenes)) {
        throw new Error("场景分析结果格式错误：缺少scenes数组");
      }

      // 验证每个场景的必需字段
      for (const scene of result.scenes) {
        if (
          !scene.scene_number ||
          !scene.description ||
          !scene.character_ids ||
          !scene.mood
        ) {
          throw new Error("场景分析结果格式错误：缺少必需字段");
        }
      }

      return result.scenes;
    } catch (parseError) {
      console.error("函数调用结果解析错误:", parseError);
      throw new Error("场景分析结果格式错误");
    }
  }
}

// 创建单例实例
export const sceneAnalysisService = new SceneAnalysisService();
