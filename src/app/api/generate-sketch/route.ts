import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@/types/api";
import { GenerationResult } from "@/types/stable-diffusion";
import { createStableDiffusionGenerator } from "@/lib/stable-diffusion-generator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const style = formData.get("style") as string;
    const controlStrength =
      parseFloat(formData.get("controlStrength") as string) || 0.7;

    if (!image) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: "未上传图片",
      });
    }

    // 将图片转换为base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString(
      "base64"
    )}`;

    // 创建生成器实例
    const generator = createStableDiffusionGenerator();

    // 生成选项
    const options = {
      image: base64Image,
      prompt: prompt || "portrait sketch",
      style: style as "simple" | "detailed" | "cute",
      controlStrength,
    };

    // 使用结构控制生成简笔画
    const result = await generator.generateSketchWithStructure(options);

    return NextResponse.json<APIResponse<GenerationResult>>({
      success: true,
      data: result,
      message: "简笔画生成成功",
    });
  } catch (error) {
    console.error("生成简笔画时出错:", error);

    return NextResponse.json<APIResponse>({
      success: false,
      error:
        error instanceof Error ? error.message : "生成简笔画时出现未知错误",
    });
  }
}
