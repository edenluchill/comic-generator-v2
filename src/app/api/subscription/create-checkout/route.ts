import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { creditService } from "@/lib/services/credit.service";
import { supabaseAdmin } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, successUrl, cancelUrl } = await request.json();

    // 验证计划ID
    if (planId !== "premium") {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // 从数据库获取订阅计划信息
    const { data: subscriptionPlan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !subscriptionPlan) {
      console.error("Failed to fetch subscription plan:", planError);
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // 检查Stripe price ID是否已配置
    if (
      !subscriptionPlan.stripe_price_id ||
      subscriptionPlan.stripe_price_id === "price_premium_monthly_placeholder"
    ) {
      console.error("Stripe price ID not configured for plan:", planId);
      return NextResponse.json(
        {
          error:
            "Subscription plan not properly configured. Please contact support.",
          details: "Stripe price ID is missing or not configured",
        },
        { status: 500 }
      );
    }

    // 获取用户档案
    const userProfile = await creditService.getUserProfile(user.id);
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    let customerId = userProfile.stripe_customer_id;

    // 如果用户没有Stripe客户ID，创建一个
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // 更新用户档案中的Stripe客户ID
      await creditService.updateSubscription(
        user.id,
        userProfile.subscription_tier,
        customerId
      );
    }

    // 创建Checkout会话
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: subscriptionPlan.stripe_price_id, // 从数据库获取的price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
