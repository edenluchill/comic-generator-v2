import {
  tool,
  UIDataTypes,
  UIMessagePart,
  UIMessageStreamWriter,
  UITools,
} from "ai";
import { z } from "zod";
import { fivePageComicService } from "@/lib/services/five-page-comic.service";
import { fivePageComicWithCharactersService } from "@/lib/services/five-page-comic-with-characters.service";
import { ChatMessage } from "@/types/chat";

interface CreateComicGenerationToolProps {
  userId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  images?: UIMessagePart<UIDataTypes, UITools>[]; // 添加这行
}

// 创建一个工厂函数来生成带有用户上下文的工具
export const createComicGenerationTool = ({
  userId,
  dataStream,
  images = [], // 添加默认值
}: CreateComicGenerationToolProps) =>
  tool({
    description:
      "Generate a comic from a user story with optional character images. This tool will analyze character photos, generate stylized characters, expand the story with character assignments, and create 5 detailed scenes with consistent characters.",
    inputSchema: z.object({
      story: z
        .string()
        .describe("The original story content provided by the user"),
      artStyle: z
        .string()
        .optional()
        .default("ghibli")
        .describe(
          "The artistic style for the comic (ghibli, cute, comic, realistic, minimal, kawaii, cartoon, etc.)"
        ),
      useCharacters: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Whether to use character-based comic generation with uploaded images"
        ),
    }),
    execute: async ({ story, artStyle = "ghibli", useCharacters = true }) => {
      if (!userId) {
        throw new Error("User authentication required for comic generation");
      }

      try {
        // 发送开始事件
        dataStream.write({
          type: "data-event-comic-start",
          data: {
            message:
              images.length > 0 && useCharacters
                ? `开始生成带有 ${images.length} 个角色的漫画...`
                : "开始生成漫画...",
          },
          transient: true,
        });

        // 创建增强的进度更新函数
        const updateProgress = (data: {
          type: string;
          message: string;
          progress: number;
          step?: string;
          currentScene?: number;
          totalScenes?: number;
          characters?: unknown[];
          characterMappings?: unknown[];
        }) => {
          dataStream.write({
            type: "data-event-comic-progress",
            data: {
              type: data.type,
              step: data.step,
              message: data.message,
              progress: data.progress,
              currentScene: data.currentScene,
              totalScenes: data.totalScenes,
            },
            transient: true,
          });
        };

        let result;

        // 完整的角色漫画生成流程：
        // 1. 分析用户提供的角色照片 (characterManagementService.analyzeAndGenerateCharacters)
        // 2. 基于分析结果和艺术风格生成角色图片 (geminiImageService)
        // 3. 使用角色信息扩展故事 (storyExpansionWithCharactersService.expandToFivePagesWithCharacters)
        // 4. 根据角色分配生成场景图片 (geminiImageService with character images)

        // 判断是否使用角色功能
        if (images.length > 0 && useCharacters) {
          // 使用带角色的完整漫画生成服务
          console.log(
            `Generating comic with ${images.length} character images using ${artStyle} style`
          );

          dataStream.write({
            type: "data-event-comic-progress",
            data: {
              type: "info",
              step: "character_mode",
              message: `检测到 ${images.length} 张角色图片，启用角色模式`,
              progress: 1,
            },
            transient: true,
          });

          result =
            await fivePageComicWithCharactersService.generateFivePageComicWithCharacters(
              {
                userId,
                story,
                artStyle,
                characterImages: images,
                updateProgress,
              }
            );

          // 发送角色信息事件 (使用现有的progress事件类型)
          if (result.characters && result.characters.length > 0) {
            dataStream.write({
              type: "data-event-comic-progress",
              data: {
                type: "characters_generated",
                step: "character_generation",
                message: `成功生成 ${result.characters.length} 个${artStyle}风格角色`,
                progress: 30,
              },
              transient: true,
            });
          }

          // 发送角色分配信息 (使用现有的progress事件类型)
          if (result.characterMappings && result.characterMappings.length > 0) {
            dataStream.write({
              type: "data-event-comic-progress",
              data: {
                type: "character_mappings",
                step: "character_assignment",
                message: "角色场景分配完成",
                progress: 35,
              },
              transient: true,
            });
          }
        } else {
          // 使用原版漫画生成服务
          console.log(
            `Generating comic without characters using ${artStyle} style`
          );

          dataStream.write({
            type: "data-event-comic-progress",
            data: {
              type: "info",
              step: "basic_mode",
              message: useCharacters
                ? "未检测到角色图片，使用基础模式"
                : "用户选择基础模式，不使用角色功能",
              progress: 1,
            },
            transient: true,
          });

          const basicResult = await fivePageComicService.generateFivePageComic({
            userId,
            story,
            artStyle,
            images,
            updateProgress,
          });

          // 转换结果格式以保持一致性
          result = {
            comic_id: basicResult.comic_id,
            scenes: basicResult.scenes,
            title: basicResult.title,
            characters: [],
            characterMappings: [],
            status: basicResult.status,
          };
        }

        // 发送漫画创建完成事件
        dataStream.write({
          type: "data-event-comic-created",
          data: {
            comic: {
              type: "comic" as const,
              title: result.title,
              scenes: result.scenes,
            },
          },
          transient: true,
        });

        // 发送完成事件
        dataStream.write({
          type: "data-event-comic-finish",
          data: {
            comic: {
              type: "comic" as const,
              title: result.title,
              scenes: result.scenes,
            },
            scenes: result.scenes,
            result: {
              ...result,
              characters: result.characters || [],
              characterMappings: result.characterMappings || [],
            },
          },
          transient: true,
        });

        // 记录完成事件
        console.log("Comic generation completed:", {
          title: result.title,
          scenes: result.scenes.length,
          characters: result.characters?.length || 0,
          hasCharacters: (result.characters?.length || 0) > 0,
        });

        // 返回结果，包含漫画数据和角色信息用于UI显示
        const successMessage =
          result.characters && result.characters.length > 0
            ? `成功为用户生成带有 ${result.characters.length} 个角色的5页漫画：${result.title}`
            : `成功为用户生成5页漫画：${result.title}`;

        return {
          message: successMessage,
          status: "completed",
          style: artStyle,
          hasCharacters: (result.characters?.length || 0) > 0,
          characterCount: result.characters?.length || 0,
          comic: {
            type: "comic" as const,
            title: result.title,
            scenes: result.scenes,
          },
          result,
        };
      } catch (error) {
        console.error("Comic generation failed:", error);

        // 发送错误事件
        dataStream.write({
          type: "data-event-comic-error",
          data: {
            error: error instanceof Error ? error.message : "未知错误",
          },
          transient: true,
        });

        throw new Error(
          `漫画生成失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    },
  });
