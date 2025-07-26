import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { creditService } from "@/lib/services/credit.service";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// 定义credit充值包
const CREDIT_PACKAGES = [
  {
    id: "credits_100",
    name: "100 积分包",
    credits: 100,
    price_cents: 299, // $2.99
    stripe_price_id: process.env.STRIPE_CREDITS_100_PRICE_ID!,
    description: "可生成约2个漫画",
    popular: false,
  },
  {
    id: "credits_500",
    name: "500 积分包",
    credits: 500,
    price_cents: 1299, // $12.99
    stripe_price_id: process.env.STRIPE_CREDITS_500_PRICE_ID!,
    description: "可生成约12个漫画",
    popular: true,
  },
  {
    id: "credits_1000",
    name: "1000 积分包",
    credits: 1000,
    price_cents: 2299, // $22.99
    stripe_price_id: process.env.STRIPE_CREDITS_1000_PRICE_ID!,
    description: "可生成约25个漫画",
    popular: false,
  },
  {
    id: "credits_2000",
    name: "2000 积分包",
    credits: 2000,
    price_cents: 3999, // $39.99 (best value)
    stripe_price_id: process.env.STRIPE_CREDITS_2000_PRICE_ID!,
    description: "可生成约50个漫画 - 最划算",
    popular: false,
  },
];

export async function GET() {
  // 获取所有充值包
  return NextResponse.json({
    success: true,
    packages: CREDIT_PACKAGES,
  });
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { user, error: authError } = await authenticateRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId, successUrl, cancelUrl } = await request.json();

    // 查找充值包
    const creditPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
    if (!creditPackage) {
      return NextResponse.json(
        { error: "Invalid package ID" },
        { status: 400 }
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

    // 创建一次性支付的Checkout会话
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: creditPackage.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment", // 一次性支付，非订阅
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/credits/purchase`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        credits_amount: creditPackage.credits.toString(),
        purchase_type: "credit_purchase",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create credit purchase session error:", error);
    return NextResponse.json(
      { error: "Failed to create purchase session" },
      { status: 500 }
    );
  }
}
