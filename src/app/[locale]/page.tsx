"use client";

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
  Image as ImageIcon,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const { getLocalizedHref } = useLocalizedNavigation();

  return (
    <div className="min-h-screen bg-amber-50/30 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 浮动元素 */}
        <div className="absolute top-20 left-10 opacity-10 animate-pulse delay-500">
          <Stars className="w-6 h-6 text-amber-400" />
        </div>
        <div className="absolute top-40 right-20 opacity-10 animate-bounce delay-700">
          <Heart className="w-5 h-5 text-orange-300" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-8 animate-pulse delay-1000">
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        {/* 背景圆点 */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-300/30 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-300/20 rounded-full animate-ping delay-700"></div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* 主要展示区 - 左右布局 */}
        <div className="grid lg:grid-cols-2 max-w-7xl mx-auto py-12 gap-12 items-center">
          {/* 左侧内容区 */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight animate-slide-in-left">
                <span
                  className="block text-amber-900 mb-2 animate-fadeIn"
                  style={{ animationDelay: "200ms" }}
                >
                  {t("title")}
                </span>
                <span
                  className="block text-amber-700 text-2xl lg:text-3xl mt-3 font-medium animate-fadeIn"
                  style={{ animationDelay: "600ms" }}
                >
                  {t("subtitle")}
                </span>
              </h1>

              <div
                className="space-y-4 text-base text-amber-800/90 leading-relaxed animate-fadeIn"
                style={{ animationDelay: "800ms" }}
              >
                <p
                  className="animate-slide-in-left"
                  style={{ animationDelay: "1000ms" }}
                >
                  {t("description1")}
                </p>
                <p
                  className="animate-slide-in-left"
                  style={{ animationDelay: "1200ms" }}
                >
                  {t("description2")}
                </p>
              </div>
            </div>

            <div
              className="animate-fadeIn"
              style={{ animationDelay: "1400ms" }}
            >
              <Link href={getLocalizedHref("/workshop")}>
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 group relative overflow-hidden animate-bounce-gentle"
                >
                  {/* 内部光效 */}
                  <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center">
                    {t("startCreating")}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 右侧展示区 - Demo */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200/30 hover:shadow-2xl transition-all duration-700 animate-float">
              <div className="space-y-6">
                <div
                  className="flex items-center justify-between animate-slide-in-down"
                  style={{ animationDelay: "500ms" }}
                >
                  <h3 className="text-xl font-semibold text-amber-900 flex items-center gap-2 animate-pulse">
                    <Zap className="w-5 h-5 text-amber-500" />
                    {t("creationMode")}
                  </h3>
                  <select
                    className="bg-white border border-amber-200 rounded-lg px-4 py-2 text-amber-800 hover:border-amber-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 animate-fadeIn"
                    style={{ animationDelay: "700ms" }}
                  >
                    <option>{t("warmHandDrawn")}</option>
                  </select>
                </div>

                {/* 主展示区域 */}
                <div className="bg-amber-50 rounded-2xl h-72 flex items-center justify-center relative overflow-hidden border border-amber-100 group animate-pulse-gentle">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30 animate-shimmer"></div>

                  {/* 装饰元素 */}
                  <div
                    className="absolute top-4 left-4 opacity-20 animate-float"
                    style={{ animationDelay: "200ms" }}
                  >
                    <Heart className="w-4 h-4 text-amber-500" />
                  </div>
                  <div
                    className="absolute top-4 right-4 opacity-20 animate-float"
                    style={{ animationDelay: "500ms" }}
                  >
                    <Stars className="w-4 h-4 text-orange-500" />
                  </div>
                  <div
                    className="absolute bottom-4 left-4 opacity-20 animate-float"
                    style={{ animationDelay: "700ms" }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>

                  {/* 悬停效果 */}
                  <div className="absolute inset-0 bg-amber-100/0 group-hover:bg-amber-100/30 transition-colors duration-500"></div>

                  <div
                    className="text-center z-10 animate-fadeIn"
                    style={{ animationDelay: "900ms" }}
                  >
                    <div className="relative">
                      <Palette className="w-16 h-16 text-amber-600 mb-4 mx-auto animate-bounce-slow group-hover:animate-spin-slow transition-all duration-500" />
                      {/* 光圈效果 */}
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-amber-400/0 group-hover:border-amber-400/50 group-hover:scale-125 transition-all duration-500"></div>
                    </div>
                    <p className="text-amber-800 font-medium text-lg mb-2">
                      {t("yourExclusiveComic")}
                    </p>
                    <p
                      className="text-amber-600 text-sm animate-fadeIn"
                      style={{ animationDelay: "1100ms" }}
                    >
                      {t("willBeBornHere")}
                    </p>
                  </div>
                </div>

                {/* 导出按钮 */}
                <div
                  className="flex justify-center animate-fadeIn"
                  style={{ animationDelay: "1300ms" }}
                >
                  <button className="bg-white hover:bg-amber-50 border border-amber-200 rounded-lg px-6 py-3 text-amber-800 font-medium transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-amber-300 animate-pulse-gentle">
                    {t("exportComic")} ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 示例作品区域 */}
        <div
          className="mb-16 animate-fade-in-up max-w-7xl mx-auto"
          style={{ animationDelay: "600ms" }}
        >
          <div className="text-center mb-8 animate-slide-in-right">
            <h4 className="text-lg font-semibold text-amber-900 mb-3 animate-pulse">
              {t("examples")}
            </h4>
            <div className="w-12 h-0.5 bg-amber-300 mx-auto rounded-full animate-shimmer"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: t("warmDaily"),
                time: t("twoMinutesAgo"),
                delay: "100ms",
              },
              {
                title: t("familyGathering"),
                time: t("oneHourAgo"),
                delay: "200ms",
              },
              {
                title: t("petDiary"),
                time: t("yesterday"),
                delay: "300ms",
              },
              {
                title: t("travelMemories"),
                time: t("twoDaysAgo"),
                delay: "400ms",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-amber-100 hover:shadow-lg hover:bg-white transition-all duration-500 cursor-pointer group animate-slide-in-right hover:scale-105"
                style={{ animationDelay: item.delay }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors animate-pulse">
                    <ImageIcon className="w-6 h-6 text-amber-700 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">
                        {t("completed")}
                      </span>
                    </div>
                    <h4 className="font-medium text-amber-900 text-sm mb-1 group-hover:text-amber-700 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-amber-600">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部特性说明 */}
        <div
          className="grid md:grid-cols-3 gap-8 animate-fade-in-up max-w-7xl mx-auto"
          style={{ animationDelay: "1000ms" }}
        >
          {[
            {
              icon: Camera,
              title: t("uploadPhotos"),
              desc: t("uploadPhotosDesc"),
              bgColor: "bg-amber-50",
              iconColor: "text-amber-600",
              borderColor: "border-amber-200",
              delay: "100ms",
            },
            {
              icon: BookOpen,
              title: t("recordStories"),
              desc: t("recordStoriesDesc"),
              bgColor: "bg-orange-50",
              iconColor: "text-orange-600",
              borderColor: "border-orange-200",
              delay: "200ms",
            },
            {
              icon: Sparkles,
              title: t("generateComics"),
              desc: t("generateComicsDesc"),
              bgColor: "bg-yellow-50",
              iconColor: "text-yellow-600",
              borderColor: "border-yellow-200",
              delay: "300ms",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className={`border ${item.borderColor} bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 animate-fade-in-up`}
              style={{ animationDelay: item.delay }}
            >
              <CardHeader className="text-center p-6">
                <div
                  className={`${item.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative animate-float`}
                >
                  <item.icon
                    className={`w-8 h-8 ${item.iconColor} group-hover:animate-bounce`}
                  />
                  {/* 脉冲效果 */}
                  <div
                    className={`absolute inset-0 ${item.bgColor} rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500`}
                  ></div>
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
