import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // 获取所有激活的订阅计划
    const { data: plans, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) {
      console.error("获取订阅计划失败:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: plans || [],
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
