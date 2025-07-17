import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@/types/api";
import { FluxGenerationResult } from "@/types/flux";
import { createFluxCharacterGenerator } from "@/lib/flux-generator";
import { storeFluxCharacterImages } from "@/lib/image-storage"; // 改为从新文件导入
import { supabaseAdmin } from "@/lib/supabase/server";

// 启动生成 - 流式响应实现两步生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // prompt,
      aspectRatio,
      outputFormat,
      promptUpsampling,
      safetyTolerance,
      input_image,
      tags, // 新增：分析特征
    } = body;

    // 获取用户信息（如果已登录）
    let userId: string | undefined;
    try {
      const token = request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(token);
        userId = user?.id;
      }
    } catch (error) {
      // 忽略认证错误，允许匿名用户使用
      console.log("Anonymous user", error);
    }

    // 创建Flux生成器实例
    const generator = createFluxCharacterGenerator();

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 第一步：生成卡通头像
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "开始生成卡通头像...",
                step: 1,
                totalSteps: 3, // 更新为3步，包括存储
              })}\n\n`
            )
          );

          const avatarResult = await generator.generateCartoonAvatar(
            input_image,
            tags,
            {
              aspectRatio: aspectRatio || "1:1",
              outputFormat: outputFormat || "png",
              promptUpsampling: promptUpsampling || false,
              safetyTolerance: safetyTolerance || 2,
            }
          );

          // 等待头像生成完成
          const completedAvatar = await generator.waitForCompletion(
            avatarResult.id,
            avatarResult.pollingUrl,
            (progress, status) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    step: 1,
                    progress: progress,
                    status: status,
                    message: `生成头像中... ${progress}%`,
                  })}\n\n`
                )
              );
            }
          );

          // 发送头像结果到前端
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "avatar_complete",
                data: completedAvatar,
                message: "头像生成完成！开始生成3视图...",
              })}\n\n`
            )
          );

          // 第二步：生成3视图
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "开始生成3视图全身图...",
                step: 2,
                totalSteps: 3,
              })}\n\n`
            )
          );

          const threeViewResult = await generator.generateThreeViewFromAvatar(
            completedAvatar.imageUrl!,
            {
              outputFormat: outputFormat || "png",
              promptUpsampling: promptUpsampling || false,
              safetyTolerance: safetyTolerance || 2,
            }
          );

          // 等待3视图生成完成
          const completedThreeView = await generator.waitForCompletion(
            threeViewResult.id,
            threeViewResult.pollingUrl,
            (progress, status) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    step: 2,
                    progress: progress,
                    status: status,
                    message: `生成3视图中... ${progress}%`,
                  })}\n\n`
                )
              );
            }
          );

          // 第三步：存储图片到 Supabase
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "正在保存图片到数据库...",
                step: 3,
                totalSteps: 3,
              })}\n\n`
            )
          );

          // 存储图片到 Supabase Storage
          const { storedAvatarUrl, storedThreeViewUrl } =
            await storeFluxCharacterImages(
              completedAvatar.imageUrl!,
              completedThreeView.imageUrl!,
              userId
            );

          // 更新结果对象中的 URL
          const finalAvatarResult = {
            ...completedAvatar,
            imageUrl: storedAvatarUrl,
          };

          const finalThreeViewResult = {
            ...completedThreeView,
            imageUrl: storedThreeViewUrl,
          };

          // 发送最终结果
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                data: {
                  avatar: finalAvatarResult,
                  threeView: finalThreeViewResult,
                },
                message: "所有生成完成！图片已保存到数据库。",
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("流式生成过程中出错:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "生成过程中出现未知错误",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("启动Flux角色生成时出错:", error);

    return NextResponse.json<APIResponse>({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "启动Flux角色生成时出现未知错误",
    });
  }
}

// 查询生成状态 - 保持原有功能
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const pollingUrl = searchParams.get("pollingUrl");

    if (!taskId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "缺少任务ID",
      });
    }

    const generator = createFluxCharacterGenerator();
    const result = await generator.getGenerationStatus(
      taskId,
      pollingUrl || undefined
    );

    return NextResponse.json<APIResponse<FluxGenerationResult>>({
      success: true,
      data: result,
      message: "状态查询成功",
    });
  } catch (error) {
    console.error("查询Flux生成状态时出错:", error);

    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "查询状态时出现未知错误",
    });
  }
}

// 支持OPTIONS请求（CORS）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
