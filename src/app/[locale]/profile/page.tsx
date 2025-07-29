"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditDisplay } from "@/components/CreditDisplay";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import {
  ProfileHeader,
  UserInfoCard,
  TransactionHistory,
} from "@/components/Profile";
// 🎉 导入统一的loading组件
import { FullScreenLoader } from "@/components/ui/loading";

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ✅ 使用统一的FullScreenLoader替代自定义LoadingState
const LoadingState = () => (
  <FullScreenLoader message="加载中..." background="light" />
);

// 错误状态组件保持不变
const ErrorState = ({
  error,
  onGoHome,
}: {
  error: string | null;
  onGoHome: () => void;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-md border-red-200">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error || "无法加载用户信息"}</p>
        <Button onClick={onGoHome} className="mt-4" variant="outline">
          返回首页
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { navigate } = useLocalizedNavigation();

  // 🎉 使用 React Query hooks - 简洁优雅！
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions(10);

  // ✅ Move navigation to useEffect to avoid render-time side effects
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // ✅ 简单的认证检查
  if (authLoading) {
    return <LoadingState />;
  }

  // ✅ Show loading while redirecting to login
  if (!user) {
    return <LoadingState />;
  }

  if (profileLoading) {
    return <LoadingState />;
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        error={profileError?.message || "无法加载用户信息"}
        onGoHome={() => navigate("/")}
      />
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isPremium = profile.subscription_tier === "premium";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <UserInfoCard
              profile={profile}
              onSignOut={handleSignOut}
              formatDate={formatDate}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CreditDisplay
              showUpgradeButton={!isPremium}
              onUpgrade={() => navigate("/pricing")}
            />
            <TransactionHistory
              transactions={transactions}
              loading={transactionsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
