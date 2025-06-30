import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Camera,
  BookOpen,
  Sparkles,
  Stars,
  Palette,
  Image,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* 增强的温馨背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 漂浮的星星 */}
        <div className="absolute top-20 left-10 opacity-20 animate-pulse">
          <Stars className="w-8 h-8 text-amber-400" />
        </div>
        <div className="absolute top-40 right-20 opacity-15 animate-bounce">
          <Sparkles className="w-6 h-6 text-orange-300" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-20 animate-pulse delay-1000">
          <Heart className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="absolute top-1/3 left-1/4 opacity-10 animate-ping">
          <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/4 opacity-10 animate-ping delay-500">
          <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
        </div>

        {/* 温馨的光晕效果 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-amber-200/10 to-transparent rounded-full animate-pulse"></div>
      </div>

      {/* 主要内容区域 - 优化布局 */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-6 items-center min-h-[85vh]">
          {/* 左侧内容区 - 4列 */}
          <div className="lg:col-span-4 space-y-6 animate-fade-in-up">
            <div className="space-y-5">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight animate-slide-in-left">
                <span className="block text-amber-900 mb-2 animate-fadeIn animation-delay-200">
                  不仅是免费的
                </span>
                <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent animate-fadeIn animation-delay-400">
                  漫画生成器
                </span>
                <span className="block text-amber-800 text-2xl lg:text-3xl mt-3 animate-fadeIn animation-delay-600">
                  - 它是{" "}
                  <span className="text-orange-600 font-black animate-pulse">
                    独属于你的
                  </span>
                </span>
              </h1>

              <div className="space-y-3 text-base text-amber-800 leading-relaxed animate-fadeIn animation-delay-800">
                <p className="animate-slide-in-left animation-delay-1000">
                  从照片到完整故事，AI 将你的记忆引入漫画创作。
                </p>
                <p className="animate-slide-in-left animation-delay-1200">
                  无需复杂工具，无需学习成本，只需 AI 驱动的漫画智能代理。
                </p>
              </div>
            </div>

            <div className="animate-fadeIn animation-delay-1400">
              <Link href="/workshop">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-8 py-3 text-lg rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-110 group animate-bounce-gentle"
                >
                  免费开始创作
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 中间展示区 - 6列 (重点区域) */}
          <div className="lg:col-span-6 animate-fade-in-up animation-delay-300">
            <div className="bg-gradient-to-br from-white/90 to-amber-50/90 rounded-3xl p-8 backdrop-blur-sm shadow-2xl border border-amber-100 hover:shadow-3xl transition-all duration-700 animate-float">
              <div className="space-y-6">
                <div className="flex items-center justify-between animate-slide-in-down animation-delay-500">
                  <h3 className="text-xl font-semibold text-amber-900 animate-pulse">
                    创作模式
                  </h3>
                  <select className="bg-white/90 border border-amber-200 rounded-lg px-4 py-2 text-amber-800 hover:bg-white transition-all duration-300 animate-fadeIn animation-delay-700">
                    <option>温馨手绘</option>
                  </select>
                </div>

                {/* 主展示区域 - 加强动画效果 */}
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl h-72 flex items-center justify-center relative overflow-hidden group animate-pulse-gentle">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30 animate-shimmer"></div>

                  {/* 漂浮的装饰元素 */}
                  <div className="absolute top-4 left-4 opacity-30 animate-float animation-delay-200">
                    <Heart className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="absolute top-4 right-4 opacity-30 animate-float animation-delay-500">
                    <Stars className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-30 animate-float animation-delay-700">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>

                  <div className="text-center z-10 animate-fadeIn animation-delay-900">
                    <Palette className="w-16 h-16 text-amber-600 mb-4 mx-auto animate-bounce-slow group-hover:animate-spin-slow transition-all duration-500" />
                    <p className="text-amber-800 font-medium text-lg">
                      你的专属漫画
                    </p>
                    <p className="text-amber-600 text-sm mt-2 animate-fadeIn animation-delay-1100">
                      即将在这里诞生
                    </p>
                  </div>
                </div>

                {/* 导出按钮 */}
                <div className="flex justify-center animate-fadeIn animation-delay-1300">
                  <button className="bg-white/90 hover:bg-white border border-amber-200 rounded-lg px-6 py-3 text-amber-800 font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 animate-pulse-gentle">
                    导出漫画 ▼
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧示例作品栏 - 2列 */}
          <div className="lg:col-span-2 space-y-3 animate-fade-in-up animation-delay-600">
            <div className="text-center mb-3 animate-slide-in-right">
              <h4 className="text-sm font-semibold text-amber-900 mb-2 animate-pulse">
                示例
              </h4>
              <div className="w-8 h-0.5 bg-gradient-to-r from-amber-300 to-orange-300 mx-auto animate-shimmer"></div>
            </div>

            {[
              {
                title: "温馨日常",
                status: "completed",
                time: "2分钟前",
                delay: "animation-delay-100",
              },
              {
                title: "家庭聚会",
                status: "completed",
                time: "1小时前",
                delay: "animation-delay-200",
              },
              {
                title: "宠物日记",
                status: "completed",
                time: "昨天",
                delay: "animation-delay-300",
              },
              {
                title: "旅行记忆",
                status: "completed",
                time: "2天前",
                delay: "animation-delay-400",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-amber-100 transform hover:scale-105 transition-all duration-500 cursor-pointer animate-slide-in-right ${item.delay} hover:shadow-lg hover:bg-white group`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:animate-pulse">
                    <Image className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">
                        完成
                      </span>
                    </div>
                    <h4 className="font-medium text-amber-900 text-sm truncate group-hover:text-amber-700 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-amber-600">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部特性说明 - 简化版 */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 animate-fade-in-up animation-delay-1000">
          {[
            {
              icon: Camera,
              title: "上传照片",
              desc: "上传你的珍贵照片，AI 会分析并创建专属漫画角色",
              colors: "from-amber-100 to-orange-100",
              iconColor: "text-amber-600",
              delay: "animation-delay-100",
            },
            {
              icon: BookOpen,
              title: "记录故事",
              desc: "分享你的回忆和故事，让AI理解情感背景",
              colors: "from-orange-100 to-yellow-100",
              iconColor: "text-orange-600",
              delay: "animation-delay-200",
            },
            {
              icon: Sparkles,
              title: "生成漫画",
              desc: "AI 创作独一无二的温馨漫画，永久保存美好回忆",
              colors: "from-yellow-100 to-amber-100",
              iconColor: "text-yellow-600",
              delay: "animation-delay-300",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className={`border-0 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group animate-fade-in-up ${item.delay} hover:-translate-y-2`}
            >
              <CardHeader className="text-center p-6">
                <div
                  className={`bg-gradient-to-br ${item.colors} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-float`}
                >
                  <item.icon
                    className={`w-8 h-8 ${item.iconColor} group-hover:animate-bounce`}
                  />
                </div>
                <CardTitle className="text-lg font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-amber-700 text-sm leading-relaxed">
                  {item.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
