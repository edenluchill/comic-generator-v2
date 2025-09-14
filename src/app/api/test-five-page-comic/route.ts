import { NextRequest, NextResponse } from "next/server";
import { fivePageComicService } from "@/lib/services/five-page-comic.service";

export async function POST(request: NextRequest) {
  try {
    const {
      story,
      style = "cute",
      userId = "test-user",
    } = await request.json();

    if (!story) {
      return NextResponse.json(
        { error: "Story content is required" },
        { status: 400 }
      );
    }

    // 创建一个简单的流式响应来测试进度更新
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // 启动5页漫画生成
        fivePageComicService
          .generateFivePageComic({
            userId,
            story,
            style,
            controller,
            encoder,
          })
          .then((result) => {
            // 发送最终结果
            const finalData = JSON.stringify({
              type: "final_result",
              data: result,
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            controller.close();
          })
          .catch((error) => {
            // 发送错误
            const errorData = JSON.stringify({
              type: "error",
              message: error.message || "Comic generation failed",
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "5-Page Comic Generation Test API",
    usage: "POST with { story: string, style?: string, userId?: string }",
    example: {
      story:
        "A young girl discovers a magical garden behind her grandmother's house.",
      style: "cute",
      userId: "test-user",
    },
  });
}
