import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { APIResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const { data: comics, error: comicsError } = await supabaseAdmin
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (comicsError) {
      console.error("获取漫画失败:", comicsError);
      return NextResponse.json({ error: "获取漫画失败" }, { status: 500 });
    }

    // 获取总数
    const { count, error: countError } = await supabaseAdmin
      .from("comic")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("获取漫画总数失败:", countError);
      return NextResponse.json({ error: "获取漫画总数失败" }, { status: 500 });
    }

    // 格式化数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedComics = comics.map((comic: any) => ({
      ...comic,
      scenes: comic.comic_scene
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.scene_order - b.scene_order)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((scene: any) => ({
          ...scene,
          characters: scene.characters || [],
        })),
    }));

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        comics: formattedComics,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      message: "获取漫画成功",
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}
