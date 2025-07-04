import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { action_type } = await request.json();

    // 获取用户当前使用情况
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("usage_stats, subscription_status")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 检查使用限制（服务器端业务逻辑）
    const currentUsage = profile.usage_stats || {};
    const limits =
      profile.subscription_status === "premium"
        ? { daily_limit: 50, monthly_limit: 500 }
        : { daily_limit: 5, monthly_limit: 50 };

    if (action_type === "generate_image") {
      const today = new Date().toISOString().split("T")[0];
      const dailyCount = currentUsage.daily_usage?.[today] || 0;
      const monthlyCount = currentUsage.images_generated || 0;

      if (dailyCount >= limits.daily_limit) {
        return NextResponse.json(
          {
            error: "Daily limit exceeded",
            limit: limits.daily_limit,
          },
          { status: 429 }
        );
      }

      if (monthlyCount >= limits.monthly_limit) {
        return NextResponse.json(
          {
            error: "Monthly limit exceeded",
            limit: limits.monthly_limit,
          },
          { status: 429 }
        );
      }

      // 更新使用统计
      const updatedStats = {
        ...currentUsage,
        images_generated: monthlyCount + 1,
        daily_usage: {
          ...currentUsage.daily_usage,
          [today]: dailyCount + 1,
        },
        last_generation: new Date().toISOString(),
      };

      await supabaseAdmin
        .from("profiles")
        .update({ usage_stats: updatedStats })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        remaining: {
          daily: limits.daily_limit - dailyCount - 1,
          monthly: limits.monthly_limit - monthlyCount - 1,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error) {
    console.error("Usage tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
