import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase/server";
import { creditService } from "@/lib/services/credit.service";
import { deleteStoredImage } from "@/lib/image-storage";

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // 获取用户当前档案信息
    const profile = await creditService.getUserProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // 如果用户之前有自定义头像，先删除它
    if (profile.override_avatar_url) {
      try {
        await deleteStoredImage(profile.override_avatar_url, "avatars");
      } catch (error) {
        console.error("删除旧头像失败:", error);
        // 继续执行，不阻断上传流程
      }
    }

    // 生成新文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}_${randomId}.${extension}`;
    const filePath = `user-uploads/${user.id}/${fileName}`;

    // 转换文件为Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // 获取公共URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // 更新用户档案中的头像URL
    const updateResult = await creditService.updateUserProfile(user.id, {
      override_avatar_url: urlData.publicUrl,
    });

    if (!updateResult.success) {
      // 如果更新数据库失败，尝试删除刚上传的文件
      try {
        await deleteStoredImage(urlData.publicUrl, "avatars");
      } catch (cleanupError) {
        console.error("清理上传文件失败:", cleanupError);
      }

      return NextResponse.json(
        { error: updateResult.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updateResult.profile,
      message: "头像更新成功",
    });
  } catch (error) {
    console.error("Replace avatar error:", error);
    return NextResponse.json(
      { error: "Failed to replace avatar" },
      { status: 500 }
    );
  }
}
