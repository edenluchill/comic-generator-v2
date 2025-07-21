import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { deleteStoredImage } from "@/lib/image-storage";
import { APIResponse } from "@/types/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 首先获取日记详情，包括所有关联的漫画场景
    const { data: diary, error: fetchError } = await supabaseAdmin
      .from("diary")
      .select(
        `
        id,
        user_id,
        comics:comic(
          id,
          comic_scene(
            id,
            image_url
          )
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !diary) {
      return NextResponse.json(
        { error: "日记不存在或无权限访问" },
        { status: 404 }
      );
    }

    // 收集所有需要删除的图片 URL
    const imageUrls: string[] = [];
    if (diary.comics) {
      for (const comic of diary.comics) {
        if (comic.comic_scene) {
          for (const scene of comic.comic_scene) {
            if (scene.image_url) {
              imageUrls.push(scene.image_url);
            }
          }
        }
      }
    }

    // 删除 Supabase Storage 中的图片
    const imageDeletePromises = imageUrls.map((imageUrl) =>
      deleteStoredImage(imageUrl, "generated-images").catch((error) => {
        console.error(`删除图片失败 ${imageUrl}:`, error);
        // 继续执行，不阻断整个删除流程
      })
    );

    await Promise.allSettled(imageDeletePromises);

    // 删除数据库记录（CASCADE 会自动删除关联的 comic 和 comic_scene）
    const { error: deleteError } = await supabaseAdmin
      .from("diary")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("删除日记失败:", deleteError);
      return NextResponse.json({ error: "删除日记失败" }, { status: 500 });
    }

    return NextResponse.json<APIResponse>({
      success: true,
      message: "日记删除成功",
    });
  } catch (error) {
    console.error("删除日记API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}
