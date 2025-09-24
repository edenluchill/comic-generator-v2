import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.MYOPENAI_API_KEY,
});

export interface StoryExpansionOptions {
  story: string;
  style?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Character {
  name: string;
  description: string;
  selectionDescription: string;
}

export interface SceneDescription {
  title: string;
  description: string;
  quote: string;
  visualElements: string;
  characters: string[];
}

export interface FivePageStoryResult {
  title: string;
  scenes: SceneDescription[];
  artStyle: string;
  allCharacters: Character[];
}

export class StoryExpansionService {
  /**
   * 将用户故事扩展为5页漫画场景
   */
  async expandToFivePages(
    options: StoryExpansionOptions
  ): Promise<FivePageStoryResult> {
    const { story, style = "cute", temperature = 0.7 } = options;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional comic story expansion expert. Your task is to expand user stories into exactly 5 comic pages with rich visual and emotional details.

Each page should follow a classic story structure:
- Page 1: Setup/Introduction
- Page 2: Rising Action
- Page 3: Climax/Turning Point
- Page 4: Falling Action/Resolution
- Page 5: Conclusion/Ending

For each scene, provide:
1. A compelling title
2. Detailed visual description suitable for AI image generation
3. A memorable quote or dialogue
4. Key visual elements that make the scene vivid

Style preference: ${style}`,
        },
        {
          role: "user",
          content: `Please expand this story into exactly 5 comic pages: "${story}"`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "expand_story_to_five_pages",
            description:
              "Expand a story into exactly 5 comic pages with detailed scene descriptions in English",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Overall title for the 5-page comic story",
                },
                artStyle: {
                  type: "string",
                  description: "The main art style of the story in English",
                },
                allCharacters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Character name",
                      },
                      description: {
                        type: "string",
                        description:
                          "Detailed character description for image generation, including appearance, clothing, and personality traits",
                      },
                      selectionDescription: {
                        type: "string",
                        description:
                          "Short description to distinguish this character from others, used for character selection",
                      },
                    },
                    required: ["name", "description", "selectionDescription"],
                  },
                  description: "All characters that appear in the story",
                },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        description: "Title for this specific page/scene",
                      },
                      description: {
                        type: "string",
                        description:
                          "Detailed English description suitable for AI image generation, including setting, characters, actions, and atmosphere",
                      },
                      quote: {
                        type: "string",
                        description:
                          "A meaningful quote, dialogue, or inner thought that captures the essence of this scene",
                      },
                      visualElements: {
                        type: "string",
                        description:
                          "Key visual elements, composition, lighting, and artistic details for this scene",
                      },
                      characters: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                        description:
                          "Array of character names that appear in this scene (subset of allCharacters)",
                      },
                    },
                    required: [
                      "title",
                      "description",
                      "quote",
                      "visualElements",
                      "characters",
                    ],
                  },
                  minItems: 5,
                  maxItems: 5,
                  description:
                    "Exactly 5 scenes representing the 5 pages of the comic",
                },
              },
              required: ["title", "artStyle", "allCharacters", "scenes"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "expand_story_to_five_pages" },
      },
      temperature: temperature,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error("故事扩展失败：无法获取GPT工具调用响应");
    }

    return this.parseFunctionCallResult(toolCall.function.arguments);
  }

  /**
   * 解析函数调用结果
   */
  private parseFunctionCallResult(
    argumentsString: string
  ): FivePageStoryResult {
    try {
      const result = JSON.parse(argumentsString);

      if (!result.title || typeof result.title !== "string") {
        throw new Error("故事扩展结果格式错误：缺少故事标题");
      }

      if (
        !result.scenes ||
        !Array.isArray(result.scenes) ||
        result.scenes.length !== 5
      ) {
        throw new Error("故事扩展结果格式错误：必须包含恰好5个场景");
      }

      if (!result.allCharacters || !Array.isArray(result.allCharacters)) {
        throw new Error("故事扩展结果格式错误：必须包含角色列表");
      }

      // 验证每个角色的必需字段
      for (let i = 0; i < result.allCharacters.length; i++) {
        const character = result.allCharacters[i];
        if (
          !character.name ||
          !character.description ||
          !character.selectionDescription
        ) {
          throw new Error(`故事扩展结果格式错误：角色${i + 1}缺少必需字段`);
        }
      }

      // 验证每个场景的必需字段
      for (let i = 0; i < result.scenes.length; i++) {
        const scene = result.scenes[i];
        if (
          !scene.title ||
          !scene.description ||
          !scene.quote ||
          !scene.visualElements ||
          !Array.isArray(scene.characters)
        ) {
          throw new Error(`故事扩展结果格式错误：场景${i + 1}缺少必需字段`);
        }
      }

      return {
        title: result.title,
        artStyle: result.artStyle || "life story",
        allCharacters: result.allCharacters.map(
          (character: {
            name: string;
            description: string;
            selectionDescription: string;
          }) => ({
            name: character.name as string,
            description: character.description as string,
            selectionDescription: character.selectionDescription as string,
          })
        ),
        scenes: result.scenes.map(
          (scene: {
            title: string;
            description: string;
            quote: string;
            visualElements: string;
            characters: string[];
          }) => ({
            title: scene.title as string,
            description: scene.description as string,
            quote: scene.quote as string,
            visualElements: scene.visualElements as string,
            characters: scene.characters as string[],
          })
        ),
      };
    } catch (parseError) {
      console.error("函数调用结果解析错误:", parseError);
      throw new Error("故事扩展结果格式错误");
    }
  }
}

// 创建单例实例
export const storyExpansionService = new StoryExpansionService();
