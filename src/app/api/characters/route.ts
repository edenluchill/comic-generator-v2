import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // 🔒 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 查询用户的角色
    const { data: characters, error } = await supabaseAdmin
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取角色失败:", error);
      return NextResponse.json({ error: "获取角色失败" }, { status: 500 });
    }

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // 插入新角色
    const { data: character, error } = await supabaseAdmin
      .from("characters")
      .insert([
        {
          user_id: user.id,
          name,
          avatar_url: avatarUrl,
          three_view_url: threeViewUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("创建角色失败:", error);
      return NextResponse.json({ error: "创建角色失败" }, { status: 500 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
