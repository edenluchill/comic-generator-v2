import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID" },
        { status: 400 }
      );
    }

    // 获取Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // 检查支付状态
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    let subscriptionData = null;

    // 如果是订阅模式，获取订阅信息
    if (session.mode === "subscription" && session.subscription) {
      const subscription = session.subscription as Stripe.Subscription;

      // 从订阅项目中获取计费周期信息
      const subscriptionItem = subscription.items?.data?.[0];
      const currentPeriodEnd = subscriptionItem?.current_period_end || 0;

      subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        current_period_end: currentPeriodEnd,
        plan_name: "Premium Plan",
      };
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error("Subscription verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
