import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.MYOPENAI_API_KEY,
});

export interface StoryExpansionWithCharactersOptions {
  story: string;
  style?: string;
  characters?: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
  }>;
  maxTokens?: number;
  temperature?: number;
}

export interface Character {
  name: string;
  description: string;
  selectionDescription: string;
}

export interface SceneDescriptionWithCharacters {
  title: string;
  description: string;
  quote: string;
  visualElements: string;
  characters: string[]; // 角色名称列表
  characterIds: string[]; // 对应的角色ID列表
}

export interface FivePageStoryWithCharactersResult {
  title: string;
  scenes: SceneDescriptionWithCharacters[];
  artStyle: string;
  allCharacters: Character[];
  characterMappings: Array<{
    sceneIndex: number;
    characterIds: string[];
  }>;
}

export class StoryExpansionWithCharactersService {
  /**
   * 将用户故事扩展为5页漫画场景，包含角色分配
   */
  async expandToFivePagesWithCharacters(
    options: StoryExpansionWithCharactersOptions
  ): Promise<FivePageStoryWithCharactersResult> {
    const {
      story,
      style = "cute",
      characters = [],
      temperature = 0.7,
    } = options;

    // 构建角色信息字符串
    const charactersInfo =
      characters.length > 0
        ? `Available characters for the story:
${characters
  .map(
    (char) =>
      `- ${char.name} (ID: ${char.id}): ${
        char.description
      } [Tags: ${char.tags.join(", ")}]`
  )
  .join("\n")}

Please assign appropriate characters to each scene based on their descriptions and the scene content.`
        : "No specific characters provided. Create generic character references if needed.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional comic story expansion expert. Your task is to expand user stories into exactly 5 comic pages with rich visual and emotional details, and assign characters to each scene.

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
5. Character assignments based on the story flow

${charactersInfo}

Style preference: ${style}`,
        },
        {
          role: "user",
          content: `Please expand this story into exactly 5 comic pages with character assignments: "${story}"`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "expand_story_to_five_pages_with_characters",
            description:
              "Expand a story into exactly 5 comic pages with detailed scene descriptions and character assignments in English",
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
                          "Detailed character description in English",
                      },
                      selectionDescription: {
                        type: "string",
                        description:
                          "Brief description for character selection",
                      },
                    },
                    required: ["name", "description", "selectionDescription"],
                  },
                  description: "List of all characters in the story",
                },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        description: "Scene title in English",
                      },
                      description: {
                        type: "string",
                        description:
                          "Detailed scene description suitable for AI image generation in English",
                      },
                      quote: {
                        type: "string",
                        description:
                          "Memorable quote or dialogue for the scene",
                      },
                      visualElements: {
                        type: "string",
                        description:
                          "Key visual elements and details in English",
                      },
                      characters: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                        description:
                          "List of character names appearing in this scene",
                      },
                      characterIds: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                        description:
                          "List of character IDs corresponding to the characters in this scene",
                      },
                    },
                    required: [
                      "title",
                      "description",
                      "quote",
                      "visualElements",
                      "characters",
                      "characterIds",
                    ],
                  },
                  description: "Array of exactly 5 scene descriptions",
                  minItems: 5,
                  maxItems: 5,
                },
              },
              required: ["title", "artStyle", "allCharacters", "scenes"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "expand_story_to_five_pages_with_characters" },
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
  ): FivePageStoryWithCharactersResult {
    try {
      const parsed = JSON.parse(argumentsString);

      // 验证必需字段
      if (!parsed.title || !parsed.scenes || !Array.isArray(parsed.scenes)) {
        throw new Error("解析结果缺少必需字段");
      }

      if (parsed.scenes.length !== 5) {
        throw new Error(`场景数量错误：期望5个，实际${parsed.scenes.length}个`);
      }

      // 创建角色映射
      const characterMappings = parsed.scenes.map(
        (
          scene: {
            characterIds?: string[];
          },
          index: number
        ) => ({
          sceneIndex: index,
          characterIds: scene.characterIds || [],
        })
      );

      return {
        title: parsed.title,
        scenes: parsed.scenes.map(
          (scene: {
            title: string;
            description: string;
            quote: string;
            visualElements: string;
            characters?: string[];
            characterIds?: string[];
          }) => ({
            title: scene.title,
            description: scene.description,
            quote: scene.quote,
            visualElements: scene.visualElements,
            characters: scene.characters || [],
            characterIds: scene.characterIds || [],
          })
        ),
        artStyle: parsed.artStyle || "cute",
        allCharacters: parsed.allCharacters || [],
        characterMappings,
      };
    } catch (error) {
      console.error("解析故事扩展结果失败:", error);
      console.error("原始响应:", argumentsString);
      throw new Error("故事扩展结果解析失败，请重试");
    }
  }

  /**
   * 智能分析角色在场景中的出现
   * 使用AI来分析哪些角色应该出现在哪些场景中
   */
  async analyzeCharacterSceneMapping(
    scenes: SceneDescriptionWithCharacters[],
    availableCharacters: Array<{
      id: string;
      name: string;
      description: string;
      tags: string[];
    }>
  ): Promise<
    Array<{
      sceneIndex: number;
      characterIds: string[];
      reasoning: string;
    }>
  > {
    if (availableCharacters.length === 0) {
      return scenes.map((_, index) => ({
        sceneIndex: index,
        characterIds: [],
        reasoning: "No characters available",
      }));
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in comic storytelling and character placement. Your task is to analyze comic scenes and determine which characters should appear in each scene based on the story flow and character descriptions.

Consider:
1. Story continuity and character arcs
2. Scene requirements and context
3. Character relevance to the scene
4. Visual balance and composition

Provide logical reasoning for each character assignment.`,
        },
        {
          role: "user",
          content: `Analyze these scenes and determine character placement:

Available Characters:
${availableCharacters
  .map(
    (char) =>
      `- ${char.name} (ID: ${char.id}): ${
        char.description
      } [Tags: ${char.tags.join(", ")}]`
  )
  .join("\n")}

Scenes:
${scenes
  .map(
    (scene, index) =>
      `Scene ${index + 1}: ${scene.title}
  Description: ${scene.description}
  Quote: "${scene.quote}"`
  )
  .join("\n\n")}

Please assign characters to scenes and provide reasoning.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_character_scene_mapping",
            description: "Analyze and assign characters to comic scenes",
            parameters: {
              type: "object",
              properties: {
                mappings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneIndex: {
                        type: "number",
                        description: "Scene index (0-based)",
                      },
                      characterIds: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                        description: "List of character IDs for this scene",
                      },
                      reasoning: {
                        type: "string",
                        description: "Explanation for character selection",
                      },
                    },
                    required: ["sceneIndex", "characterIds", "reasoning"],
                  },
                },
              },
              required: ["mappings"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "analyze_character_scene_mapping" },
      },
      temperature: 0.3,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      // 如果AI分析失败，返回默认映射
      return scenes.map((_, index) => ({
        sceneIndex: index,
        characterIds: availableCharacters.map((char) => char.id),
        reasoning: "Default assignment - all characters in all scenes",
      }));
    }

    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      return parsed.mappings || [];
    } catch (error) {
      console.error("解析角色场景映射失败:", error);
      // 返回默认映射
      return scenes.map((_, index) => ({
        sceneIndex: index,
        characterIds: availableCharacters.map((char) => char.id),
        reasoning: "Fallback assignment due to parsing error",
      }));
    }
  }
}

// 创建单例实例
export const storyExpansionWithCharactersService =
  new StoryExpansionWithCharactersService();
