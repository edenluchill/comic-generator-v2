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

export default function PricingPage() {
  // 重新设计功能对比 - 突出价值和团队连接
  const coreFeatures = [
    {
      name: "每月可用额度",
      free: "100 积分",
      pro: "1200 积分",
      icon: <Zap className="w-4 h-4" />,
      highlight: true,
      desc: "角色生成10分，漫画20分",
    },
    {
      name: "实际可生成",
      free: "~5次漫画",
      pro: "~60次漫画",
      icon: <TrendingUp className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "漫画水印",
      free: "显眼水印",
      pro: "完全无水印",
      icon: <Shield className="w-4 h-4" />,
      highlight: true,
    },
    {
      name: "导出画质",
      free: "720P标清",
      pro: "4K超高清",
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
      pro: "优先处理",
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

          {/* 社会证明 */}
          <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mt-4">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span>4.9分好评</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span>5000+用户选择伙伴版</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span>与团队共同成长</span>
            </div>
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
                        <span className="text-xs font-medium text-gray-600">
                          {feature.free}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm"
                size="sm"
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
                <Heart className="w-3 h-3 inline mr-1" />
                支持独立开发
              </div>
            </div>

            <CardHeader className="pb-4 pt-0">
              <CardTitle className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  拾光伙伴
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    $5.99
                  </span>
                  <span className="text-base font-normal text-gray-500">
                    /月
                  </span>
                </div>
                <p className="text-xs text-amber-700 font-medium bg-amber-100 px-2 py-1 rounded">
                  支持我们，与团队共同成长
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
                        <span className="text-xs font-bold text-amber-700">
                          {feature.pro}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md text-sm font-semibold"
                size="sm"
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                成为拾光伙伴
              </Button>

              <p className="text-center text-xs text-amber-700 mt-2 font-medium">
                💬 加入专属群聊，与团队直接交流
              </p>
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
                12倍创作量
              </h3>
              <p className="text-xs text-gray-600">
                从每月5次提升到60次，记录生活不受限
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

        {/* 用户见证 */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 text-amber-400 fill-current"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 italic mb-3">
              &quot;成为拾光伙伴后，不仅制作了无数珍贵的4K无水印漫画回忆，还能直接和团队交流新功能想法。感觉自己也参与了产品的成长！&quot;
            </p>
            <p className="text-xs text-gray-500">
              — 王小美，上海，拾光伙伴 3个月
            </p>
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
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                成为拾光伙伴
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                size="sm"
              >
                先用免费版试试
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              随时可取消，支持我们的每一分钱都用于改进产品
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
