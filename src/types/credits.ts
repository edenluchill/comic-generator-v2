// ===========================================
// Credit系统类型定义
// ===========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  override_avatar_url?: string; // 新增自定义头像字段

  // 订阅信息
  subscription_status: "free" | "premium";
  subscription_tier: "free" | "premium";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_expires_at?: string;

  // Credit相关
  current_credits: number;
  monthly_credit_limit: number;
  credits_reset_date: string;

  // 统计信息
  total_comics_generated: number;
  total_characters_created: number;

  // 时间戳
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;

  // 交易信息
  transaction_type:
    | "deduction"
    | "refill"
    | "monthly_reset"
    | "subscription_bonus";
  amount: number; // 正数为增加，负数为扣减

  // 关联信息
  related_entity_type?: string; // 'comic', 'character', 'subscription' 等
  related_entity_id?: string; // 关联的实体ID

  // 描述信息
  description: string;
  metadata?: Record<string, string | number | boolean>; // 存储额外信息

  // 余额快照
  balance_before: number;
  balance_after: number;

  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_cents: number; // 价格（分）
  currency: string;

  // Credit配置
  monthly_credits: number;

  // 功能配置
  features: {
    max_characters?: number; // -1表示无限制
    watermark?: boolean;
    quality?: "720p" | "4k";
    priority_processing?: boolean;
  };

  // Stripe配置
  stripe_price_id: string;

  // 状态
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface UserProfileWithStats extends UserProfile {
  plan_name: string;
  plan_features: SubscriptionPlan["features"];
  total_transactions: number;
  total_credits_spent: number;
}

// ===========================================
// API相关类型
// ===========================================

export interface CreditCheckResult {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  message?: string;
}

export interface CreditDeductionRequest {
  userId: string;
  amount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CreditDeductionResult {
  success: boolean;
  transaction?: CreditTransaction;
  remainingCredits: number;
  message?: string;
}

export interface SubscriptionCheckoutRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  message?: string;
}

// 新增更新用户资料的接口
export interface UpdateUserProfileRequest {
  full_name?: string;
  override_avatar_url?: string;
}

// ===========================================
// 常量定义
// ===========================================

export const CREDIT_COSTS = {
  COMIC_GENERATION: 40, // 一个漫画4个场景，每个场景10个credit
  CHARACTER_GENERATION: 20, // 生成Flux角色（头像+3视图）
  SCENE_REGENERATION: 10, // 重新生成单个场景
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

export const TRANSACTION_TYPES = {
  DEDUCTION: "deduction",
  REFILL: "refill",
  MONTHLY_RESET: "monthly_reset",
  SUBSCRIPTION_BONUS: "subscription_bonus",
} as const;
