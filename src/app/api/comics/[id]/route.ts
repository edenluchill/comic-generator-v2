import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { deleteStoredImage } from "@/lib/image-storage";
import { APIResponse } from "@/types/api";

// 获取单个漫画
export async function GET(
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

    const { data: comic, error } = await supabaseAdmin
      .from("comic")
      .select(
        `
        *,
        comic_scene(
          id,
          scene_order,
          content,
          scenario_description,
          mood,
          quote,
          image_url,
          image_prompt,
          characters,
          status,
          retry_count,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !comic) {
      return NextResponse.json(
        { error: "漫画不存在或无权限访问" },
        { status: 404 }
      );
    }

    // 格式化数据
    const formattedComic = {
      ...comic,
      scenes: comic.comic_scene
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.scene_order - b.scene_order)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((scene: any) => ({
          ...scene,
          characters: scene.characters || [],
        })),
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: formattedComic,
      message: "获取漫画成功",
    });
  } catch (error) {
    console.error("获取漫画API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}

// 更新漫画
export async function PUT(
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

    const body = await request.json();
    const { title, content, mood, date } = body;

    // 输入验证 - 至少需要提供一个要更新的字段
    if (
      title === undefined &&
      content === undefined &&
      mood === undefined &&
      date === undefined
    ) {
      return NextResponse.json(
        { error: "至少需要提供一个要更新的字段" },
        { status: 400 }
      );
    }

    // 构建更新对象，只包含提供的字段
    const updateData: Partial<{
      title: string;
      content: string;
      mood: string;
      date: string;
    }> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (mood !== undefined) updateData.mood = mood;
    if (date !== undefined) updateData.date = date;

    // 更新漫画
    const { data: comic, error } = await supabaseAdmin
      .from("comic")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // 确保只能更新自己的漫画
      .select()
      .single();

    if (error) {
      console.error("更新漫画失败:", error);
      return NextResponse.json({ error: "更新漫画失败" }, { status: 500 });
    }

    if (!comic) {
      return NextResponse.json(
        { error: "漫画不存在或无权限" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comic,
      message: "漫画更新成功",
    });
  } catch (error) {
    console.error("更新漫画API错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 }
    );
  }
}

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

    // 首先获取漫画详情，包括所有关联的场景
    const { data: comic, error: fetchError } = await supabaseAdmin
      .from("comic")
      .select(
        `
        id,
        user_id,
        comic_scene(
          id,
          image_url
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !comic) {
      return NextResponse.json(
        { error: "漫画不存在或无权限访问" },
        { status: 404 }
      );
    }

    // 收集所有需要删除的图片 URL
    const imageUrls: string[] = [];
    if (comic.comic_scene) {
      for (const scene of comic.comic_scene) {
        if (scene.image_url) {
          imageUrls.push(scene.image_url);
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

    // 删除数据库记录（CASCADE 会自动删除关联的 comic_scene）
    const { error: deleteError } = await supabaseAdmin
      .from("comic")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("删除漫画失败:", deleteError);
      return NextResponse.json({ error: "删除漫画失败" }, { status: 500 });
    }

    return NextResponse.json<APIResponse>({
      success: true,
      message: "漫画删除成功",
    });
  } catch (error) {
    console.error("删除漫画API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}
