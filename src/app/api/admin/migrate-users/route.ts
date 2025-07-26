import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { creditService } from "@/lib/services/credit.service";

export async function POST(request: NextRequest) {
  try {
    // 简单的管理员验证（生产环境中应该使用更安全的方式）
    const { adminKey } = await request.json();

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取所有用户
    const { data: users, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error("获取用户列表失败:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const results = {
      total: users.users.length,
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // 为每个用户创建或检查profile
    for (const user of users.users) {
      try {
        // 检查用户是否已有profile
        const existingProfile = await creditService.getUserProfile(user.id);

        if (existingProfile) {
          results.skipped++;
          continue;
        }

        // 创建新的profile
        const created = await creditService.createUserProfile(user.id, {
          email: user.email || "",
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        });

        if (created) {
          results.migrated++;
          console.log(`✅ 为用户 ${user.email} 创建了profile`);
        } else {
          results.errors.push(`Failed to create profile for ${user.email}`);
        }
      } catch (error) {
        console.error(`处理用户 ${user.email} 时出错:`, error);
        results.errors.push(`Error processing ${user.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User migration completed",
      results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
