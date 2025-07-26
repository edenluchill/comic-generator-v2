"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
interface SubscriptionStatus {
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    current_period_end: number;
    plan_name: string;
  };
  error?: string;
}

export default function SubscriptionSuccessPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { navigate } = useLocalizedNavigation();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus({
        success: false,
        error: "Missing session ID",
      });
      setLoading(false);
      return;
    }

    verifySubscription();
  }, [sessionId]);

  const verifySubscription = async () => {
    try {
      const response = await fetch(
        `/api/subscription/verify?session_id=${sessionId}`
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setStatus({
          success: false,
          error: "Failed to verify subscription",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus({
        success: false,
        error: "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <h2 className="text-xl font-semibold">验证订阅状态...</h2>
              <p className="text-muted-foreground text-center">
                正在确认您的订阅，请稍候
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-red-600">订阅失败</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {status?.error || "订阅过程中出现问题"}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="flex-1"
              >
                返回定价页面
              </Button>
              <Button onClick={() => navigate("/profile")} className="flex-1">
                查看账户
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            🎉 订阅成功！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              欢迎加入 Comic AI Generator Premium
            </h3>
            <p className="text-muted-foreground">
              您现在可以享受所有高级功能了！
            </p>
          </div>

          {status.subscription && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">订阅详情</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>计划：</span>
                  <span className="font-medium">Premium Plan</span>
                </div>
                <div className="flex justify-between">
                  <span>状态：</span>
                  <span className="font-medium text-green-600">
                    {status.subscription.status === "active"
                      ? "已激活"
                      : status.subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>下次续费：</span>
                  <span className="font-medium">
                    {new Date(
                      status.subscription.current_period_end * 1000
                    ).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              🚀 您现在可以享受：
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 每月1000积分</li>
              <li>• 无限角色创建</li>
              <li>• 4K高清画质</li>
              <li>• 无水印导出</li>
              <li>• 优先处理队列</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => navigate("/workshop")}
              className="flex-1"
              size="lg"
            >
              开始创作
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              size="lg"
            >
              查看账户
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            如有任何问题，请联系客服支持
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
