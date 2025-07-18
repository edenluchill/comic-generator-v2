import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { ComicGenerationRequest } from "@/types/diary";
import { APIResponse } from "@/types/api";
import { comicGenerationService } from "@/lib/services/comic-generation.service";
import { StreamUtils } from "@/lib/services/stream-utils";

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body: ComicGenerationRequest = await request.json();
    const { diary_content, characters, style = "cute" } = body;

    // 输入验证
    if (!diary_content || !characters || characters.length === 0) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 创建流式响应
    const encoder = StreamUtils.createEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用漫画生成服务
          const result = await comicGenerationService.generateComic({
            userId: user.id,
            diaryContent: diary_content,
            characters,
            style,
            controller,
            encoder,
          });

          // 发送最终结果
          StreamUtils.encodeComplete(
            encoder,
            controller,
            result,
            "漫画生成完成！"
          );
        } catch (error) {
          console.error("漫画生成过程中出错:", error);
          StreamUtils.encodeError(
            encoder,
            controller,
            error instanceof Error ? error.message : "生成过程中出现未知错误"
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: StreamUtils.createStreamHeaders(),
    });
  } catch (error) {
    console.error("启动漫画生成时出错:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error:
        error instanceof Error ? error.message : "启动漫画生成时出现未知错误",
    });
  }
}
