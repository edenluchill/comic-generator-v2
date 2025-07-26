"use client";

import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Clock,
  TrendingUp,
  Calendar,
  AlertCircle,
  Crown,
} from "lucide-react";

interface CreditDisplayProps {
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
}

export function CreditDisplay({
  showUpgradeButton = true,
  onUpgrade,
}: CreditDisplayProps) {
  // ✅ 使用缓存的 hooks 替代手动 fetch
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions(5);

  const loading = profileLoading || transactionsLoading;
  const error = profileError?.message;

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">
            {error || "Unable to load credit information"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPremium = profile.subscription_tier === "premium";
  // ✅ 移除limit相关逻辑，因为用户可以无限充值
  const isLowCredit = profile.current_credits < 40; // 一个漫画的成本
  const resetDate = new Date(profile.credits_reset_date);
  const daysUntilReset = Math.ceil(
    (resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      {/* 主要Credit卡片 */}
      <Card
        className={`w-full ${
          isPremium
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
            : "bg-white border-gray-200"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap
                className={`w-5 h-5 ${
                  isPremium ? "text-amber-600" : "text-gray-600"
                }`}
              />
              <h3 className="font-semibold text-gray-900">积分余额</h3>
              {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
            </div>
            {isPremium && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                拾光伙伴
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Credit余额显示 - 简化版本 */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {profile.current_credits}
                </span>
                <span className="text-lg text-gray-500">积分</span>
              </div>

              {/* 积分状态指示 */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLowCredit ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isLowCredit ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isLowCredit ? "积分不足，建议充值" : "积分充足"}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                可生成约 {Math.floor(profile.current_credits / 40)} 个漫画
              </div>
            </div>

            {/* 重置时间 - 仅对免费用户显示 */}
            {!isPremium && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {daysUntilReset > 0
                    ? `${daysUntilReset}天后获得免费积分`
                    : "今天获得免费积分"}
                </span>
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {profile.total_comics_generated}
                </div>
                <div className="text-sm text-gray-500">已生成漫画</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {profile.total_characters_created}
                </div>
                <div className="text-sm text-gray-500">创建角色</div>
              </div>
            </div>

            {/* 升级按钮 */}
            {!isPremium && showUpgradeButton && (
              <Button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                升级到拾光伙伴
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 最近交易记录 */}
      {transactions.length > 0 && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">最近使用记录</h4>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.amount > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-gray-700">
                      {transaction.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                    <Clock className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
