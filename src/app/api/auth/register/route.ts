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

    // 检查用户是否已存在
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 创建用户配置文件（服务器端控制）
    const newProfile = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.full_name || user.user_metadata.name,
      avatar_url: user.user_metadata.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_status: "free",
      usage_stats: {
        images_generated: 0,
        stories_created: 0,
        daily_limit: 5,
        monthly_limit: 50,
      },
      preferences: {
        language: "en",
        theme: "light",
      },
    };

    const { data: profile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error("Profile creation error:", createError);
      return NextResponse.json(
        { error: "Profile creation failed" },
        { status: 500 }
      );
    }

    // 记录用户注册事件
    await supabaseAdmin.from("user_events").insert([
      {
        user_id: user.id,
        event_type: "user_registered",
        event_data: {
          registration_method: "oauth",
          provider: user.app_metadata.provider,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
