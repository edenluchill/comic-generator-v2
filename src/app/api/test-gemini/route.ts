import { NextRequest, NextResponse } from "next/server";
import {
  geminiImageService,
  GeminiImageService,
} from "@/lib/services/gemini-image.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, imageUrls = [] } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 准备输入图片
    const inputImages = [];

    for (const url of imageUrls) {
      try {
        const imageInput = await GeminiImageService.urlToImageInput(url);
        inputImages.push(imageInput);
      } catch (error) {
        console.warn(`Failed to load image from URL ${url}:`, error);
      }
    }

    // 生成图片
    const result = await geminiImageService.generateImage({
      prompt,
      inputImages,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Test Gemini API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 添加 GET 方法用于测试连接
export async function GET() {
  return NextResponse.json({
    message: "Gemini test endpoint is working",
    usage: {
      method: "POST",
      body: {
        prompt: "string (required) - Description of the image to generate",
        imageUrls: "string[] (optional) - Array of image URLs to use as input",
      },
      example: {
        prompt: "Create a cute cartoon character in a coffee shop",
        imageUrls: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
      },
    },
  });
}
