"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id: string;
  description: string;
  popular: boolean;
}

// interface CreditPurchaseProps {
//   onPurchaseComplete?: (credits: number) => void;
// }

export function CreditPurchase() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditPackages();
  }, []);

  const fetchCreditPackages = async () => {
    try {
      const response = await fetch("/api/credits/purchase");

      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      } else {
        setError("Failed to load credit packages");
      }
    } catch (err) {
      setError("Error loading credit packages");
      console.error("Credit packages fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      alert("请先登录");
      return;
    }

    setPurchasing(packageId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("登录状态过期，请重新登录");
        return;
      }

      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          packageId,
          successUrl: `${window.location.origin}/credits/success`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("购买失败，请稍后重试");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("购买失败，请稍后重试");
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const calculateValue = (credits: number, cents: number) => {
    const pricePerCredit = cents / credits;
    return (pricePerCredit / 100).toFixed(4);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载充值包...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // 找到最划算的包（每credit最便宜）
  const bestValuePackage = packages.reduce((best, current) => {
    const currentValue = current.price_cents / current.credits;
    const bestValue = best.price_cents / best.credits;
    return currentValue < bestValue ? current : best;
  }, packages[0]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">充值积分</h2>
        <p className="text-gray-600">选择适合的积分包，立即充值到账</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          const isPopular = pkg.popular;
          const isBestValue = pkg.id === bestValuePackage?.id;
          const isPurchasing = purchasing === pkg.id;

          return (
            <Card
              key={pkg.id}
              className={`relative transition-all hover:shadow-lg ${
                isPopular
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                  : isBestValue
                  ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white px-3 py-1 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    热门选择
                  </Badge>
                </div>
              )}

              {isBestValue && !isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    最划算
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap
                      className={`w-5 h-5 ${
                        isPopular
                          ? "text-amber-600"
                          : isBestValue
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    />
                    <span className="text-lg font-semibold">{pkg.name}</span>
                  </div>

                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(pkg.price_cents)}
                  </div>

                  <div className="text-sm text-gray-500">
                    {pkg.credits} 积分
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    每积分 ${calculateValue(pkg.credits, pkg.price_cents)}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    {pkg.description}
                  </p>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isPurchasing}
                    className={`w-full ${
                      isPopular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        : isBestValue
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        立即购买
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>💳 支持所有主流信用卡 | 🔒 256位SSL加密保护 | ⚡ 充值后立即到账</p>
      </div>
    </div>
  );
}
