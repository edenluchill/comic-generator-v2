import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatarUrl, threeViewUrl } = body;

    // 🔒 输入验证
    if (!name || !avatarUrl || !threeViewUrl) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 更新角色
    const { data: character, error } = await supabaseAdmin
      .from("characters")
      .update({
        name,
        avatar_url: avatarUrl,
        three_view_url: threeViewUrl,
      })
      .eq("id", params.id)
      .eq("user_id", user.id) // 确保只能更新自己的角色
      .select()
      .single();

    if (error) {
      console.error("更新角色失败:", error);
      return NextResponse.json({ error: "更新角色失败" }, { status: 500 });
    }

    if (!character) {
      return NextResponse.json(
        { error: "角色不存在或无权限" },
        { status: 404 }
      );
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 删除角色
    const { error } = await supabaseAdmin
      .from("characters")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id); // 确保只能删除自己的角色

    if (error) {
      console.error("删除角色失败:", error);
      return NextResponse.json({ error: "删除角色失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
