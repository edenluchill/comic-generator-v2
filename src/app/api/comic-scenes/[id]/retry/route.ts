import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { APIResponse } from "@/types/api";
import { comicDatabaseService } from "@/lib/services/comic-database.service";
import { sceneImageService } from "@/lib/services/scene-image.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { id } = await params;
    const sceneId = id;

    // 获取请求体中的新描述
    const body = await request.json();
    const newDescription = body.new_description;

    // 获取场景信息
    const { scene, style } = await comicDatabaseService.getSceneForRetry(
      sceneId,
      user.id
    );

    // 使用新描述（如果提供了）或原始描述
    const descriptionToUse = newDescription || scene.scenario_description;

    // 更新场景状态
    await comicDatabaseService.updateSceneRetryCount(
      sceneId,
      scene.retry_count
    );

    try {
      // 重试生成场景图片
      const imageResult = await sceneImageService.retrySceneImage(
        sceneId,
        descriptionToUse,
        style,
        user.id
      );

      // 更新场景记录（包括新的描述）
      const updatedScene = await comicDatabaseService.updateSceneImage(
        sceneId,
        imageResult.imageUrl,
        imageResult.imagePrompt,
        newDescription
      );

      return NextResponse.json<APIResponse>({
        success: true,
        data: updatedScene,
        message: "场景重新生成成功",
      });
    } catch (error) {
      console.error("场景重试生成失败:", error);

      // 更新场景状态为失败
      await comicDatabaseService.updateSceneStatus(sceneId, "failed");

      return NextResponse.json<APIResponse>({
        success: false,
        error: error instanceof Error ? error.message : "场景重试生成失败",
      });
    }
  } catch (error) {
    console.error("场景重试API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}
