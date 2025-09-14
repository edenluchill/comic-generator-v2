import { tool, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { fivePageComicService } from "@/lib/services/five-page-comic.service";
import { ChatMessage } from "@/types/chat";

interface CreateComicGenerationToolProps {
  userId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// 创建一个工厂函数来生成带有用户上下文的工具
export const createComicGenerationTool = ({
  userId,
  dataStream,
}: CreateComicGenerationToolProps) =>
  tool({
    description:
      "Generate a comic from a user story. This tool will expand the story, create 5 detailed scenes, and generate images for each page.",
    inputSchema: z.object({
      story: z
        .string()
        .describe("The original story content provided by the user"),
      style: z
        .string()
        .optional()
        .default("cute")
        .describe(
          "The artistic style for the comic (cute, realistic, minimal, kawaii, etc.)"
        ),
    }),
    execute: async ({ story, style = "cute" }) => {
      if (!userId) {
        throw new Error("User authentication required for comic generation");
      }

      try {
        // 发送开始事件
        dataStream.write({
          type: "data-event-comic-start",
          data: {
            message: "开始生成漫画...",
          },
          transient: true,
        });

        // 创建进度更新函数
        const updateProgress = (data: {
          type: string;
          message: string;
          progress: number;
          step?: string;
          currentScene?: number;
          totalScenes?: number;
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

        // 启动漫画生成
        const result = await fivePageComicService.generateFivePageComic({
          userId,
          story,
          style,
          updateProgress,
        });

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
            result,
          },
          transient: true,
        });

        // 记录完成事件
        console.log("Comic generation completed:", {
          title: result.title,
          scenes: result.scenes.length,
        });

        // 返回结果，包含漫画数据用于UI显示
        return {
          message: `成功为用户生成5页漫画：${result.title}`,
          status: "completed",
          style,
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
