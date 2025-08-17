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
import { Loader } from "./ui/loading";

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
      <Card className="w-full bg-card border-border">
        <CardContent className="p-6">
          <Loader message="加载积分信息..." color="primary" size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full border-destructive/20 bg-card">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">
            {error || "Unable to load credit information"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPremium = profile.subscription_tier === "premium";
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
            ? "bg-gradient-to-br from-secondary/50 to-accent/30 border-primary/30 shadow-lg shadow-primary/10"
            : "bg-card border-border"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap
                className={`w-5 h-5 ${
                  isPremium ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <h3 className="font-semibold text-foreground">积分余额</h3>
            </div>
            {isPremium && (
              <span className="bg-secondary text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                拾光伙伴
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Credit余额显示 */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {profile.current_credits}
                </span>
                <span className="text-lg text-muted-foreground">积分</span>
              </div>

              {/* 积分状态指示 */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLowCredit ? "bg-destructive" : "bg-chart-3"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isLowCredit ? "text-destructive" : "text-chart-3"
                  }`}
                >
                  {isLowCredit ? "积分不足，建议充值" : "积分充足"}
                </span>
              </div>
            </div>

            {/* 重置时间 - 仅对免费用户显示 */}
            {!isPremium && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {daysUntilReset > 0
                    ? `${daysUntilReset}天后获得免费积分`
                    : "今天获得免费积分"}
                </span>
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-xl font-semibold text-foreground">
                  {profile.total_comics_generated}
                </div>
                <div className="text-sm text-muted-foreground">已生成漫画</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-foreground">
                  {profile.total_characters_created}
                </div>
                <div className="text-sm text-muted-foreground">创建角色</div>
              </div>
            </div>

            {/* 升级按钮 */}
            {!isPremium && showUpgradeButton && (
              <Button onClick={onUpgrade} className="btn-theme-primary w-full">
                <Crown className="w-4 h-4 mr-2" />
                升级到拾光伙伴
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 最近交易记录 */}
      {transactions.length > 0 && (
        <Card className="w-full bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-foreground">最近使用记录</h4>
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
                        transaction.amount > 0 ? "bg-chart-3" : "bg-destructive"
                      }`}
                    />
                    <span className="text-muted-foreground">
                      {transaction.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-chart-3"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                    <Clock className="w-3 h-3 text-muted-foreground" />
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
