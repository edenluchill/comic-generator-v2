import { supabaseAdmin } from "@/lib/supabase/server";
import {
  UserProfile,
  CreditTransaction,
  CreditCheckResult,
  CreditDeductionRequest,
  CreditDeductionResult,
  TRANSACTION_TYPES,
} from "@/types/credits";

// ===========================================
// Credit管理服务
// ===========================================

export class CreditService {
  /**
   * 创建用户档案
   */
  async createUserProfile(
    userId: string,
    userData: {
      email: string;
      full_name?: string;
      avatar_url?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
      });

      if (error) {
        console.error("创建用户档案失败:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("createUserProfile error:", error);
      return false;
    }
  }

  /**
   * 获取用户档案信息
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("获取用户档案失败:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("getUserProfile error:", error);
      return null;
    }
  }

  /**
   * 检查用户是否有足够的credits
   */
  async checkCredits(
    userId: string,
    requiredCredits: number
  ): Promise<CreditCheckResult> {
    try {
      const profile = await this.getUserProfile(userId);

      if (!profile) {
        return {
          hasEnoughCredits: false,
          currentCredits: 0,
          requiredCredits,
          message: "用户档案不存在",
        };
      }

      const hasEnoughCredits = profile.current_credits >= requiredCredits;

      return {
        hasEnoughCredits,
        currentCredits: profile.current_credits,
        requiredCredits,
        message: hasEnoughCredits
          ? undefined
          : `余额不足，需要 ${requiredCredits} credits，当前只有 ${profile.current_credits} credits`,
      };
    } catch (error) {
      console.error("checkCredits error:", error);
      return {
        hasEnoughCredits: false,
        currentCredits: 0,
        requiredCredits,
        message: "检查credits时出错",
      };
    }
  }

  /**
   * 扣减用户credits
   */
  async deductCredits(
    request: CreditDeductionRequest
  ): Promise<CreditDeductionResult> {
    const {
      userId,
      amount,
      description,
      relatedEntityType,
      relatedEntityId,
      metadata,
    } = request;

    try {
      // 开始事务
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          remainingCredits: 0,
          message: "用户档案不存在",
        };
      }

      // 检查余额
      if (profile.current_credits < amount) {
        return {
          success: false,
          remainingCredits: profile.current_credits,
          message: `余额不足，需要 ${amount} credits，当前只有 ${profile.current_credits} credits`,
        };
      }

      const newBalance = profile.current_credits - amount;

      // 更新用户余额
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          current_credits: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("更新用户余额失败:", updateError);
        return {
          success: false,
          remainingCredits: profile.current_credits,
          message: "扣减credits失败",
        };
      }

      // 记录交易
      const { data: transaction, error: transactionError } = await supabaseAdmin
        .from("credit_transactions")
        .insert({
          user_id: userId,
          transaction_type: TRANSACTION_TYPES.DEDUCTION,
          amount: -amount, // 负数表示扣减
          related_entity_type: relatedEntityType,
          related_entity_id: relatedEntityId,
          description,
          metadata: metadata || {},
          balance_before: profile.current_credits,
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) {
        console.error("记录交易失败:", transactionError);
        // 即使记录交易失败，扣减已经成功，返回成功但没有交易记录
      }

      return {
        success: true,
        transaction: transaction || undefined,
        remainingCredits: newBalance,
        message: `成功扣减 ${amount} credits，剩余 ${newBalance} credits`,
      };
    } catch (error) {
      console.error("deductCredits error:", error);
      return {
        success: false,
        remainingCredits: 0,
        message: "扣减credits时出错",
      };
    }
  }

  /**
   * 为用户充值credits
   */
  async addCredits(
    userId: string,
    amount: number,
    description: string,
    transactionType: CreditTransaction["transaction_type"] = TRANSACTION_TYPES.REFILL,
    metadata?: Record<string, string | number | boolean>
  ): Promise<CreditDeductionResult> {
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          remainingCredits: 0,
          message: "用户档案不存在",
        };
      }

      const newBalance = profile.current_credits + amount;

      // 更新用户余额
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          current_credits: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("更新用户余额失败:", updateError);
        return {
          success: false,
          remainingCredits: profile.current_credits,
          message: "充值credits失败",
        };
      }

      // 记录交易
      const { data: transaction, error: transactionError } = await supabaseAdmin
        .from("credit_transactions")
        .insert({
          user_id: userId,
          transaction_type: transactionType,
          amount: amount, // 正数表示增加
          description,
          metadata: metadata || {},
          balance_before: profile.current_credits,
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) {
        console.error("记录交易失败:", transactionError);
      }

      return {
        success: true,
        transaction: transaction || undefined,
        remainingCredits: newBalance,
        message: `成功充值 ${amount} credits，余额 ${newBalance} credits`,
      };
    } catch (error) {
      console.error("addCredits error:", error);
      return {
        success: false,
        remainingCredits: 0,
        message: "充值credits时出错",
      };
    }
  }

  /**
   * 获取用户的交易历史
   */
  async getCreditTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("获取交易历史失败:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("getCreditTransactions error:", error);
      return [];
    }
  }

  /**
   * 更新用户订阅状态
   */
  async updateSubscription(
    userId: string,
    subscriptionTier: "free" | "premium",
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      const updates: Partial<UserProfile> = {
        subscription_status: subscriptionTier,
        subscription_tier: subscriptionTier,
        updated_at: new Date().toISOString(),
      };

      if (stripeCustomerId) {
        updates.stripe_customer_id = stripeCustomerId;
      }

      if (stripeSubscriptionId) {
        updates.stripe_subscription_id = stripeSubscriptionId;
      }

      if (expiresAt) {
        updates.subscription_expires_at = expiresAt.toISOString();
      }

      // 如果升级到premium，更新credit限制
      if (subscriptionTier === "premium") {
        updates.monthly_credit_limit = 1000;
      } else {
        updates.monthly_credit_limit = 60;
      }

      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update(updates)
        .eq("id", userId);

      if (error) {
        console.error("更新订阅状态失败:", error);
        return false;
      }

      // 如果升级到premium，给予订阅奖励credits
      if (subscriptionTier === "premium") {
        await this.addCredits(
          userId,
          1000,
          "Premium subscription bonus",
          TRANSACTION_TYPES.SUBSCRIPTION_BONUS,
          { plan: "premium" }
        );
      }

      return true;
    } catch (error) {
      console.error("updateSubscription error:", error);
      return false;
    }
  }

  /**
   * 检查并重置月度credits（定期任务调用）
   */
  async resetMonthlyCreditsForUser(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);

      if (!profile) {
        return false;
      }

      const resetDate = new Date(profile.credits_reset_date);
      const now = new Date();

      // 检查是否需要重置
      if (resetDate <= now) {
        const { error } = await supabaseAdmin
          .from("user_profiles")
          .update({
            current_credits: profile.monthly_credit_limit,
            credits_reset_date: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              now.getDate()
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("重置月度credits失败:", error);
          return false;
        }

        // 记录重置交易
        await this.addCredits(
          userId,
          profile.monthly_credit_limit - profile.current_credits,
          "Monthly credit reset",
          TRANSACTION_TYPES.MONTHLY_RESET
        );

        return true;
      }

      return false; // 不需要重置
    } catch (error) {
      console.error("resetMonthlyCreditsForUser error:", error);
      return false;
    }
  }

  /**
   * 更新用户档案信息
   */
  async updateUserProfile(
    userId: string,
    updates: {
      full_name?: string;
      override_avatar_url?: string;
    }
  ): Promise<{ success: boolean; profile?: UserProfile; message?: string }> {
    try {
      // 构建更新对象，只包含有值的字段
      const updateData: Partial<UserProfile> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.full_name !== undefined) {
        updateData.full_name = updates.full_name;
      }

      if (updates.override_avatar_url !== undefined) {
        updateData.override_avatar_url = updates.override_avatar_url;
      }

      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .update(updateData)
        .eq("id", userId)
        .select("*")
        .single();

      if (error) {
        console.error("更新用户档案失败:", error);
        return {
          success: false,
          message: "更新用户档案失败",
        };
      }

      return {
        success: true,
        profile: data,
        message: "用户档案更新成功",
      };
    } catch (error) {
      console.error("updateUserProfile error:", error);
      return {
        success: false,
        message: "更新用户档案时出错",
      };
    }
  }
}

// 导出单例
export const creditService = new CreditService();
