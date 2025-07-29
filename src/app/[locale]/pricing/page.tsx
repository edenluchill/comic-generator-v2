"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Users,
  Clock,
  TrendingUp,
  PhoneOutgoing,
  MessageCircle,
  Heart,
  Coffee,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { makeAuthenticatedJsonRequest } from "@/lib/auth-request"; // ✅ 导入新函数

export default function PricingPage() {
  const { user, loading } = useAuth(); // ✅ 获取loading状态
  const { navigate, getLocalizedHref } = useLocalizedNavigation();

  // 添加年付/月付切换状态
  const [isYearly, setIsYearly] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // 处理订阅逻辑
  const handleSubscribe = async () => {
    if (loading) {
      console.log("Still loading auth state, please wait...");
      return;
    }

    if (!user) {
      // 保存当前页面URL，登录后回到这里
      sessionStorage.setItem("returnUrl", window.location.pathname);
      navigate("/login");
      return;
    }

    setSubscriptionLoading(true);
    try {
      // ✅ 使用新的认证请求函数
      const data = await makeAuthenticatedJsonRequest<{
        success: boolean;
        checkoutUrl: string;
      }>("/api/subscription/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          planId: "premium",
          // 🔧 修复：在successUrl中包含session_id模板
          successUrl: `${window.location.origin}${getLocalizedHref(
            "/subscription/success"
          )}/?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("订阅失败，请稍后重试");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      if (error instanceof Error && error.message.includes("用户未登录")) {
        navigate("/login");
      } else {
        alert("订阅失败，请稍后重试");
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleFreeTrial = () => {
    // ✅ 同样检查loading状态
    if (loading) {
      console.log("Still loading auth state, please wait...");
      return;
    }

    if (!user) {
      sessionStorage.setItem("returnUrl", "/workshop");
      navigate("/login");
    } else {
      navigate("/workshop");
    }
  };

  // 优化功能对比 - 让"痛点"更痛，"爽点"更爽
  const coreFeatures = [
    {
      name: "每月可用额度",
      free: "60 积分",
      pro: "1000 积分",
      icon: <Zap className="w-4 h-4" />,
      highlight: true,
      desc: "一个漫画消耗40积分",
    },
    {
      name: "实际可生成",
      free: "~1次漫画",
      pro: "~25次漫画",
      icon: <TrendingUp className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "漫画水印",
      free: "包含'拾光岛'品牌水印",
      freeSubtext: "(影响分享效果)",
      pro: "完全无水印",
      proSubtext: "(适合社交分享)",
      icon: <Shield className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "导出画质",
      free: "720P标清",
      freeSubtext: "(适合手机预览)",
      pro: "4K超高清",
      proSubtext: "(适合社交分享与实体打印)",
      icon: <PhoneOutgoing className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "专属角色数",
      free: "最多2个",
      pro: "无限制",
      icon: <Star className="w-4 h-4" />,
    },
    {
      name: "生成速度",
      free: "普通队列",
      freeSubtext: "(可能需要等待)",
      pro: "优先处理",
      proSubtext: "(快速完成)",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      name: "团队交流",
      free: false,
      pro: true,
      icon: <MessageCircle className="w-4 h-4" />,
      highlight: true,
      desc: "直接与产品团队沟通",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/40 to-amber-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            选择适合你的计划
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            让你的珍贵回忆永远以最美的方式保存，并与我们一起打造更好的产品
          </p>

          {/* 增强社会证明 */}
          <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mt-4">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span>4.9分好评 (2,847条评价)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span>5000+用户选择伙伴版</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span>本月新增823位伙伴</span>
            </div>
          </div>

          {/* 年付/月付切换 */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span
              className={`text-sm ${
                !isYearly ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              按月付费
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isYearly ? "bg-amber-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                isYearly ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              按年付费
            </span>
            {isYearly && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                立省$12
              </span>
            )}
          </div>
        </div>

        {/* 价格卡片 */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {/* 免费版 */}
          <Card className="relative bg-white border border-gray-200 shadow-sm">
            <div className="absolute -top-2 left-4 bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
              功能受限
            </div>

            <CardHeader className="pb-4 pt-0">
              <CardTitle className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  免费体验
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  $0
                  <span className="text-base font-normal text-gray-500">
                    /月
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">仅适合轻度体验</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3 mb-6">
                {coreFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="text-gray-400 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-700 text-xs">
                        {feature.name}
                      </div>
                      {feature.desc && (
                        <div className="text-gray-500 text-xs mt-0.5">
                          {feature.desc}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-400" />
                        )
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-medium text-gray-600 block">
                            {feature.free}
                          </span>
                          {feature.freeSubtext && (
                            <span className="text-xs text-red-400 block">
                              {feature.freeSubtext}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm"
                size="sm"
                onClick={handleFreeTrial}
              >
                免费试试看
              </Button>

              <p className="text-center text-xs text-gray-500 mt-2">
                用完额度需等待下月重置
              </p>
            </CardContent>
          </Card>

          {/* 拾光伙伴版 */}
          <Card className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-md">
                <Star className="w-3 h-3 inline mr-1" />
                {isYearly ? "最受欢迎" : "支持独立开发"}
              </div>
            </div>

            <CardHeader className="pb-4 pt-0">
              <CardTitle className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  拾光伙伴
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isYearly ? (
                    <>
                      <div className="text-center flex flex-row items-baseline">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg text-gray-400 line-through">
                            $71.88
                          </span>
                          <div className="text-3xl font-bold text-gray-900">
                            $59.99
                            <span className="text-base font-normal text-gray-500">
                              /年
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        $5.99
                        <span className="text-base font-normal text-gray-500">
                          /月
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-amber-700 font-medium bg-amber-100 px-2 py-1 rounded">
                  {isYearly
                    ? "一次付费，全年无忧 + 立省2个月费用"
                    : "支持我们，与团队共同成长"}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3 mb-6">
                {coreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2.5 ${
                      feature.highlight
                        ? "bg-amber-100 -mx-2 px-2 py-1.5 rounded-lg border border-amber-200"
                        : ""
                    }`}
                  >
                    <div className="text-amber-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-800 text-xs font-medium">
                        {feature.name}
                      </div>
                      {feature.desc && (
                        <div className="text-gray-600 text-xs mt-0.5">
                          {feature.desc}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-300" />
                        )
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-700 block">
                            {feature.pro}
                          </span>
                          {feature.proSubtext && (
                            <span className="text-xs text-green-600 block">
                              {feature.proSubtext}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md text-sm font-semibold"
                size="sm"
                onClick={handleSubscribe}
                disabled={loading || subscriptionLoading} // ✅ 考虑两种loading状态
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                {loading
                  ? "验证登录状态..."
                  : subscriptionLoading
                  ? "处理中..."
                  : "成为拾光伙伴"}
              </Button>

              {/* 添加退款保证 */}
              <div className="text-center mt-3">
                <p className="text-xs text-amber-700 font-medium">
                  💬 加入专属群聊，与团队直接交流
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  ✅ 7天无理由退款保证
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 价值主张 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            成为拾光伙伴，你将获得更多
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                15倍创作量
              </h3>
              <p className="text-xs text-gray-600">
                从每月4次提升到60次，记录生活不受限
              </p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                直接沟通渠道
              </h3>
              <p className="text-xs text-gray-600">
                专属群聊，与产品团队直接交流，反馈更快响应
              </p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                支持独立开发
              </h3>
              <p className="text-xs text-gray-600">
                每月一杯咖啡的价格，支持我们持续改进产品
              </p>
            </div>
          </div>
        </div>

        {/* 增强版用户见证 - 更真实具体 */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">真实用户反馈</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3 text-amber-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 italic mb-2">
                &quot;用它记录了和宝宝的第一个生日，4K画质打印出来后全家人都超喜欢！现在每个月都会做几本家庭相册。&quot;
              </p>
              <p className="text-xs text-gray-500">— 来自小红书的@妈妈日记本</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3 text-blue-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 italic mb-2">
                &quot;成为拾光伙伴后不仅制作数量大幅增加，还能直接和团队交流功能想法。感觉自己也参与了产品成长！&quot;
              </p>
              <p className="text-xs text-gray-500">
                — 王小美，上海，拾光伙伴 3个月
              </p>
            </div>
          </div>
        </div>

        {/* 底部CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 max-w-xl mx-auto">
            <p className="text-gray-600 mb-4 text-sm">
              和我们一起打造更好的产品，
              <span className="text-amber-700 font-medium">你的想法很重要</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold"
                size="sm"
                onClick={handleSubscribe}
                disabled={loading || subscriptionLoading} // ✅ 考虑两种loading状态
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                {loading
                  ? "验证登录状态..."
                  : subscriptionLoading
                  ? "处理中..."
                  : "成为拾光伙伴"}
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                size="sm"
                onClick={handleFreeTrial}
              >
                先用免费版试试
              </Button>
            </div>
            {/* 强化退款保证和风险消除 */}
            <div className="mt-4 space-y-1">
              <p className="text-xs text-green-600 font-medium">
                🛡️ 7天无理由退款保证 - 对订阅不满意？联系我们全额退款
              </p>
              <p className="text-xs text-gray-500">
                随时可取消，支持我们的每一分钱都用于改进产品
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
