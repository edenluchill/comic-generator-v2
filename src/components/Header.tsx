"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { Home, Pencil, Palette, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { lazy, memo } from "react";
import { useAuth } from "@/hooks/useAuth";

const AccountMenu = lazy(() => import("./Header/AccountMenu"));
const LanguagePicker = lazy(() => import("./Header/LanguagePicker"));

const Header = memo(function Header() {
  const pathname = usePathname();
  const { getLocalizedHref } = useLocalizedNavigation();
  const t = useTranslations("Navigation");
  const headerT = useTranslations("Header");
  const { profile, loading } = useAuth();

  const isActive = (path: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  const isPremium = profile?.subscription_tier === "premium";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-md border-b border-amber-200/30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo区域 */}
          <Link
            href={getLocalizedHref("/")}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 border-2 border-amber-400/50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:border-amber-500 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-amber-400/20">
                <Palette className="w-5 h-5 text-amber-600 group-hover:text-amber-700 transition-colors" />
              </div>
            </div>
            <div className="">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {headerT("title")}
              </h1>
              <p className="text-xs text-amber-600/70 -mt-1">
                {headerT("subtitle")}
              </p>
            </div>
          </Link>

          {/* 右侧功能区 */}
          <div className="flex items-center gap-1">
            {/* 桌面端导航链接 - 独立分组 */}
            <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-amber-200/40 shadow-sm">
              <Link href={getLocalizedHref("/")}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 transition-all duration-200",
                    "flex items-center gap-0.5",
                    "text-sm font-medium",
                    isActive("/")
                      ? "bg-amber-500/20 text-amber-800 shadow-sm border-amber-300/50"
                      : "text-amber-700/90 hover:bg-amber-500/10 hover:text-amber-800",
                    "rounded-md border border-transparent"
                  )}
                >
                  <Home className="w-4 h-4" />
                  <span>{t("home")}</span>
                </Button>
              </Link>

              <Link href={getLocalizedHref("/workshop")}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 transition-all duration-200",
                    "flex items-center gap-1.5",
                    "text-sm font-medium",
                    isActive("/workshop")
                      ? "bg-orange-500/20 text-orange-800 shadow-sm border-orange-300/50"
                      : "text-orange-700/90 hover:bg-orange-500/10 hover:text-orange-800",
                    "rounded-md border border-transparent"
                  )}
                >
                  <Pencil className="w-4 h-4" />
                  <span>{t("workshop")}</span>
                </Button>
              </Link>
            </nav>

            {/* 功能按钮组 */}
            <div className="flex items-center gap-1.5">
              {/* 语言选择器 */}
              <LanguagePicker />

              {/* 升级按钮 - 根据loading和premium状态显示 */}
              {loading ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-8 px-3 transition-all duration-200 flex items-center gap-1.5 text-sm font-medium text-yellow-700/60 bg-yellow-500/5 rounded-md border border-yellow-200/30"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">检查中...</span>
                </Button>
              ) : !isPremium ? (
                <Link href={getLocalizedHref("/pricing")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 transition-all duration-200",
                      "flex items-center gap-1.5",
                      "text-sm font-medium text-yellow-700/90",
                      "hover:bg-yellow-500/15 hover:text-yellow-800",
                      "hover:shadow-sm",
                      "rounded-md border border-transparent hover:border-yellow-400/30",
                      "relative overflow-hidden",
                      isActive("/pricing") &&
                        "bg-yellow-500/15 text-yellow-800 border-yellow-400/30"
                    )}
                  >
                    <Crown className="w-4 h-4 drop-shadow-sm" />
                    <span className="hidden sm:inline">升级专业版</span>
                    <span className="sm:hidden">升级</span>
                  </Button>
                </Link>
              ) : null}

              {/* 账户菜单 */}
              <div className="hidden md:block">
                <AccountMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
