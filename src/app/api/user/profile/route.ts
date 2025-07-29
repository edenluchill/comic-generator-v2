import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { creditService } from "@/lib/services/credit.service";
import { UpdateUserProfileRequest } from "@/types/credits";

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取用户档案，如果不存在则创建
    let profile = await creditService.getUserProfile(user.id);

    if (!profile) {
      // 为现有用户创建档案
      const created = await creditService.createUserProfile(user.id, {
        email: user.email || "",
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      });

      if (created) {
        profile = await creditService.getUserProfile(user.id);
      }

      if (!profile) {
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    }

    // 检查是否需要重置月度credits
    await creditService.resetMonthlyCreditsForUser(user.id);

    // 重新获取可能已更新的档案
    const updatedProfile = await creditService.getUserProfile(user.id);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 解析请求体
    const body: UpdateUserProfileRequest = await request.json();

    // 验证请求数据
    if (!body.full_name && !body.override_avatar_url) {
      return NextResponse.json(
        {
          error:
            "At least one field (full_name or override_avatar_url) is required",
        },
        { status: 400 }
      );
    }

    // 更新用户档案
    const result = await creditService.updateUserProfile(user.id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      message: result.message,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
