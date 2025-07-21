import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { deleteStoredImage } from "@/lib/image-storage";
import { UpdateCharacterData } from "@/types/characters";

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 🔒 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatarUrl, threeViewUrl } = body;

    // 🔒 输入验证 - 现在支持部分更新，至少需要一个字段
    if (!name && !avatarUrl && !threeViewUrl) {
      return NextResponse.json(
        { error: "至少需要提供一个要更新的字段" },
        { status: 400 }
      );
    }

    // 构建更新对象，只包含提供的字段
    const updateData: UpdateCharacterData = {};
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (threeViewUrl !== undefined) updateData.three_view_url = threeViewUrl;

    // 更新角色
    const { data: character, error } = await supabaseAdmin
      .from("characters")
      .update(updateData)
      .eq("id", id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 🔒 认证检查
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 首先获取角色信息，包括图片URL
    const { data: character, error: fetchError } = await supabaseAdmin
      .from("characters")
      .select("id, avatar_url, three_view_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !character) {
      return NextResponse.json(
        { error: "角色不存在或无权限" },
        { status: 404 }
      );
    }

    // 删除 Supabase Storage 中的图片
    const imageDeletePromises = [];

    if (character.avatar_url) {
      imageDeletePromises.push(
        deleteStoredImage(character.avatar_url, "generated-images").catch(
          (error) => {
            console.error(`删除头像失败 ${character.avatar_url}:`, error);
          }
        )
      );
    }

    if (character.three_view_url) {
      imageDeletePromises.push(
        deleteStoredImage(character.three_view_url, "generated-images").catch(
          (error) => {
            console.error(`删除3视图失败 ${character.three_view_url}:`, error);
          }
        )
      );
    }

    // 并行删除图片（即使失败也继续删除数据库记录）
    await Promise.allSettled(imageDeletePromises);

    // 删除数据库中的角色记录
    const { error: deleteError } = await supabaseAdmin
      .from("characters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("删除角色失败:", deleteError);
      return NextResponse.json({ error: "删除角色失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
