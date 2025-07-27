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

    const characterList = characters.map((c) => `${c.name}`).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
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
7. IMPORTANT: Use the exact character names from the available characters list: ${characterList}

Example: If a scene involves a character named "菠萝塞东", describe it as: "The scene shows <菠萝塞东> walking in the park..."`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_diary_scenes",
            description:
              "Split diary content into 4 comic scenes with character names marked in angle brackets and mood analysis",
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
                          "English scene description suitable for AI image generation. Character names should be wrapped in angle brackets like <character_name>",
                      },
                      mood: {
                        type: "string",
                        description:
                          "Overall mood/emotion of the scene (e.g., happy, sad, excited, peaceful, etc.)",
                      },
                    },
                    required: ["scene_number", "description", "mood"],
                  },
                  minItems: 4,
                  maxItems: 4,
                },
              },
              required: ["scenes"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "analyze_diary_scenes" },
      },
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("场景分析失败：无法获取GPT工具调用响应");
    }

    return this.parseFunctionCallResult(
      toolCall.function.arguments,
      characters
    );
  }

  /**
   * 解析函数调用结果并从描述中提取角色IDs
   */
  private parseFunctionCallResult(
    argumentsString: string,
    characters: Character[]
  ): SceneDescription[] {
    try {
      const result = JSON.parse(argumentsString);

      if (!result.scenes || !Array.isArray(result.scenes)) {
        throw new Error("场景分析结果格式错误：缺少scenes数组");
      }

      // 验证每个场景的必需字段并解析角色IDs
      const parsedScenes: SceneDescription[] = result.scenes.map(
        (scene: SceneDescription) => {
          if (!scene.scene_number || !scene.description || !scene.mood) {
            throw new Error("场景分析结果格式错误：缺少必需字段");
          }

          // 从描述中提取角色名并转换为IDs
          const character_ids = this.extractCharacterIds(
            scene.description,
            characters
          );

          return {
            scene_number: scene.scene_number,
            description: scene.description,
            character_ids: character_ids,
            mood: scene.mood,
          };
        }
      );

      return parsedScenes;
    } catch (parseError) {
      console.error("函数调用结果解析错误:", parseError);
      throw new Error("场景分析结果格式错误");
    }
  }

  /**
   * 从场景描述中提取角色名并转换为角色IDs
   */
  private extractCharacterIds(
    description: string,
    characters: Character[]
  ): string[] {
    const characterIds: string[] = [];

    // 使用正则表达式匹配 <角色名> 格式
    const characterNameMatches = description.match(/<([^>]+)>/g);

    if (characterNameMatches) {
      for (const match of characterNameMatches) {
        // 提取尖括号内的角色名
        const characterName = match.replace(/[<>]/g, "");

        // 在角色列表中查找对应的ID
        const character = characters.find((c) => c.name === characterName);

        if (character && !characterIds.includes(character.id)) {
          characterIds.push(character.id);
        }
      }
    }

    return characterIds;
  }
}

// 创建单例实例
export const sceneAnalysisService = new SceneAnalysisService();
