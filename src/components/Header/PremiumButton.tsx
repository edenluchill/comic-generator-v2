"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { useState, useEffect, useRef, memo } from "react";
import { useAuth } from "@/hooks/useAuth";

const PremiumButton = memo(function PremiumButton() {
  const pathname = usePathname();
  const { getLocalizedHref } = useLocalizedNavigation();
  const { user, profile, loading } = useAuth();

  // 动画状态管理
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);
  const [upgradeButtonVisible, setUpgradeButtonVisible] = useState(false);
  const previousLoadingRef = useRef(loading);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  const isActive = (path: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  const isPremium = profile?.subscription_tier === "premium";
  const isLoggedIn = !!user;

  // 监听loading状态变化，触发动画
  useEffect(() => {
    const wasLoading = previousLoadingRef.current;
    const isNowLoaded = !loading;

    // 当从loading状态变为loaded状态，且用户已登录但不是premium时
    if (wasLoading && isNowLoaded && isLoggedIn && !isPremium) {
      // 清除之前的定时器
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // 开始动画
      setUpgradeButtonVisible(true);
      setTimeout(() => {
        setShowUpgradeAnimation(true);
      }, 50); // 轻微延迟确保DOM更新

      // 2.4秒后结束特殊动画效果 (刚好2个完整周期: 1.2s × 2 = 2.4s)
      animationTimeoutRef.current = setTimeout(() => {
        setShowUpgradeAnimation(false);
      }, 2400);
    }

    // 更新上一次的loading状态
    previousLoadingRef.current = loading;

    // 如果用户不符合显示条件，隐藏按钮
    if (!isLoggedIn || isPremium || loading) {
      setUpgradeButtonVisible(false);
      setShowUpgradeAnimation(false);
    }
  }, [loading, isLoggedIn, isPremium]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // 如果正在加载、未登录或已是premium用户，则不显示任何内容
  if (loading || !isLoggedIn || isPremium || !upgradeButtonVisible) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "transition-all duration-500 ease-out overflow-hidden",
          upgradeButtonVisible ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
        )}
      >
        <Link href={getLocalizedHref("/pricing")}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 transition-all duration-300",
              "flex items-center gap-1.5 whitespace-nowrap",
              "text-sm font-medium text-yellow-700/90",
              "hover:bg-yellow-500/15 hover:text-yellow-800",
              "hover:shadow-sm",
              "rounded-md border border-transparent hover:border-yellow-400/30",
              "relative overflow-hidden",
              isActive("/pricing") &&
                "bg-yellow-500/15 text-yellow-800 border-yellow-400/30",
              // 可爱的弹性动画
              showUpgradeAnimation && "bounce-continuously"
            )}
            style={
              {
                // 移除内联动画样式，改用CSS类
              }
            }
          >
            <Crown
              className={cn(
                "w-4 h-4 drop-shadow-sm transition-all duration-300",
                showUpgradeAnimation && "animate-bounce"
              )}
            />
            <span className="hidden sm:inline">升级专业版</span>
            <span className="sm:hidden">升级</span>

            {/* 闪光效果 */}
            {showUpgradeAnimation && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping opacity-75 rounded-md" />
            )}
          </Button>
        </Link>
      </div>

      {/* 自定义CSS动画样式 */}
      <style jsx>{`
        @keyframes squeeze-in {
          0% {
            max-width: 0;
            opacity: 0;
            transform: scale(0.8);
          }
          60% {
            max-width: 150px;
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            max-width: 150px;
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-continuously {
          0%,
          100% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(1.03) translateY(-1px);
          }
          50% {
            transform: scale(1.05) translateY(-2px);
          }
          75% {
            transform: scale(1.03) translateY(-1px);
          }
        }

        .squeeze-in {
          animation: squeeze-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bounce-continuously {
          animation: bounce-continuously 1.2s ease-in-out infinite;
          animation-fill-mode: both;
        }

        /* 动画结束时的过渡 */
        .bounce-continuously.ending {
          animation: bounce-continuously 1.2s ease-in-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </>
  );
});

export default PremiumButton;
