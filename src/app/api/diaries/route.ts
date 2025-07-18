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

    // 查询用户的日记，包括关联的漫画信息
    const { data: diaries, error: diariesError } = await supabaseAdmin
      .from("diary")
      .select(
        `
        id,
        user_id,
        title,
        content,
        mood,
        date,
        status,
        created_at,
        updated_at,
        comics:comic(
          id,
          title,
          style,
          status,
          created_at,
          comic_scene(
            id,
            scene_order,
            image_url,
            status
          )
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (diariesError) {
      console.error("获取日记失败:", diariesError);
      return NextResponse.json({ error: "获取日记失败" }, { status: 500 });
    }

    // 获取总数
    const { count, error: countError } = await supabaseAdmin
      .from("diary")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("获取日记总数失败:", countError);
      return NextResponse.json({ error: "获取日记总数失败" }, { status: 500 });
    }

    // 直接返回数据，不需要格式化
    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        diaries: diaries, // 直接使用，不需要格式化
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      message: "获取日记成功",
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: error instanceof Error ? error.message : "服务器内部错误",
    });
  }
}
