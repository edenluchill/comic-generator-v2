import { NextRequest, NextResponse } from "next/server";
import { creditService } from "@/lib/services/credit.service";
import Stripe from "stripe";

// 扩展Stripe类型以避免TypeScript错误
interface ExtendedSubscription extends Stripe.Subscription {
  current_period_end: number;
  metadata: Record<string, string>;
}

interface ExtendedInvoice extends Stripe.Invoice {
  subscription: string | Stripe.Subscription | null;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret =
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_WEBHOOK_SECRET_LOCAL!
    : process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    // 🔧 添加调试信息
    console.log("=== Webhook Debug Info ===");
    console.log("Webhook secret configured:", !!webhookSecret);
    console.log("Webhook secret length:", webhookSecret?.length || 0);
    console.log(
      "Webhook secret prefix:",
      webhookSecret?.substring(0, 10) + "..."
    );
    console.log("Signature header:", signature);
    console.log("Body length:", body.length);
    console.log("Body preview:", body.substring(0, 100) + "...");

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Webhook signature verification SUCCESS");
      console.log("Event type:", event.type);
      console.log("Event ID:", event.id);
    } catch (err) {
      console.error("❌ Webhook signature verification FAILED:");
      console.error("Error message:", (err as Error).message);
      console.error("Error type:", (err as Error).constructor.name);

      // 检查环境变量
      console.error("Environment check:");
      console.error(
        "- STRIPE_SECRET_KEY set:",
        !!process.env.STRIPE_SECRET_KEY
      );
      console.error(
        "- STRIPE_WEBHOOK_SECRET set:",
        !!process.env.STRIPE_WEBHOOK_SECRET
      );
      console.error("- NODE_ENV:", process.env.NODE_ENV);

      return NextResponse.json(
        {
          error: "Invalid signature",
          debug: {
            webhookSecretSet: !!webhookSecret,
            signatureReceived: !!signature,
            bodyLength: body.length,
            errorMessage: (err as Error).message,
          },
        },
        { status: 400 }
      );
    }

    // 处理不同的事件类型
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          "Processing checkout.session.completed for session:",
          session.id
        );
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as ExtendedSubscription;
        console.log(
          "Processing customer.subscription.created for subscription:",
          subscription.id
        );
        console.log("Subscription metadata:", subscription.metadata);
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as ExtendedSubscription;
        console.log(
          "Processing customer.subscription.updated for subscription:",
          subscription.id
        );
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as ExtendedSubscription;
        console.log(
          "Processing customer.subscription.deleted for subscription:",
          subscription.id
        );
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as ExtendedInvoice;
        console.log(
          "Processing invoice.payment_succeeded for invoice:",
          invoice.id
        );
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as ExtendedInvoice;
        console.log(
          "Processing invoice.payment_failed for invoice:",
          invoice.id
        );
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 处理结账完成
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session:", session.id);
      return;
    }

    // 如果是订阅模式，订阅创建事件会处理升级
    if (session.mode === "subscription") {
      console.log(`Subscription checkout completed for user ${userId}`);
      return;
    }

    // 如果是一次性支付模式，处理credit购买
    if (session.mode === "payment") {
      const purchaseType = session.metadata?.purchase_type;

      if (purchaseType === "credit_purchase") {
        const creditsAmount = parseInt(session.metadata?.credits_amount || "0");
        const packageId = session.metadata?.package_id;

        if (creditsAmount > 0) {
          const result = await creditService.addCredits(
            userId,
            creditsAmount,
            `购买积分包 - ${packageId}`,
            "refill",
            {
              package_id: packageId || "",
              stripe_session_id: session.id,
              payment_method: "stripe_checkout",
            }
          );

          if (result.success) {
            console.log(
              `User ${userId} purchased ${creditsAmount} credits successfully`
            );
          } else {
            console.error(
              `Failed to add credits for user ${userId}:`,
              result.message
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Handle checkout completed error:", error);
  }
}

// 处理订阅创建
async function handleSubscriptionCreated(subscription: ExtendedSubscription) {
  try {
    const userId = subscription.metadata?.user_id;
    const planId = subscription.metadata?.plan_id;

    if (!userId || planId !== "premium") {
      console.error("Invalid subscription metadata:", subscription.id);
      return;
    }

    // 计算订阅到期时间
    const expiresAt = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 默认30天

    // 更新用户订阅状态
    const success = await creditService.updateSubscription(
      userId,
      "premium",
      subscription.customer as string,
      subscription.id,
      expiresAt
    );

    if (success) {
      console.log(`User ${userId} upgraded to premium subscription`);
    } else {
      console.error(`Failed to upgrade user ${userId} to premium`);
    }
  } catch (error) {
    console.error("Handle subscription created error:", error);
  }
}

// 处理订阅更新
async function handleSubscriptionUpdated(subscription: ExtendedSubscription) {
  try {
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error(
        "Missing user_id in subscription metadata:",
        subscription.id
      );
      return;
    }

    // 根据订阅状态更新用户档案
    const isActive = subscription.status === "active";
    const tier = isActive ? "premium" : "free";
    const expiresAt = new Date(subscription.current_period_end * 1000);

    await creditService.updateSubscription(
      userId,
      tier,
      subscription.customer as string,
      subscription.id,
      expiresAt
    );

    console.log(`User ${userId} subscription updated: ${subscription.status}`);
  } catch (error) {
    console.error("Handle subscription updated error:", error);
  }
}

// 处理订阅删除/取消
async function handleSubscriptionDeleted(subscription: ExtendedSubscription) {
  try {
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error(
        "Missing user_id in subscription metadata:",
        subscription.id
      );
      return;
    }

    // 降级用户到免费版
    await creditService.updateSubscription(
      userId,
      "free",
      subscription.customer as string
    );

    console.log(`User ${userId} subscription canceled`);
  } catch (error) {
    console.error("Handle subscription deleted error:", error);
  }
}

// 处理支付成功
async function handlePaymentSucceeded(invoice: ExtendedInvoice) {
  try {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subscriptionId) {
      return; // 不是订阅支付
    }

    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as unknown as ExtendedSubscription;

    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error(
        "Missing user_id in subscription metadata:",
        subscription.id
      );
      return;
    }

    // 续费成功，延长订阅期限
    const expiresAt = new Date(subscription.current_period_end * 1000);

    await creditService.updateSubscription(
      userId,
      "premium",
      subscription.customer as string,
      subscription.id,
      expiresAt
    );

    console.log(`User ${userId} subscription renewed successfully`);
  } catch (error) {
    console.error("Handle payment succeeded error:", error);
  }
}

// 处理支付失败
async function handlePaymentFailed(invoice: ExtendedInvoice) {
  try {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subscriptionId) {
      return; // 不是订阅支付
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error(
        "Missing user_id in subscription metadata:",
        subscription.id
      );
      return;
    }

    console.log(
      `Payment failed for user ${userId}, subscription ${subscription.id}`
    );

    // 可以在这里发送邮件通知用户支付失败
    // 或者暂时保持premium状态给用户一些时间来处理支付问题
  } catch (error) {
    console.error("Handle payment failed error:", error);
  }
}
