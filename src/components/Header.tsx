"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { Home, Pencil, Palette, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
// import LanguagePicker from "./Header/LanguagePicker";
// import AccountMenu from "./Header/AccountMenu";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { lazy, memo } from "react";

const AccountMenu = lazy(() => import("./Header/AccountMenu"));
const LanguagePicker = lazy(() => import("./Header/LanguagePicker"));

const Header = memo(function Header() {
  const pathname = usePathname();
  const { getLocalizedHref } = useLocalizedNavigation();
  const t = useTranslations("Navigation");
  const headerT = useTranslations("Header");

  const isActive = (path: string) => {
    // 移除语言前缀进行路径比较
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-md border-b border-amber-200/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
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
          <div className="flex items-center gap-3">
            {/* 桌面端导航链接 */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href={getLocalizedHref("/")}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 transition-all duration-300",
                    "flex items-center gap-2",
                    "text-sm font-medium text-amber-700/80",
                    "hover:bg-amber-500/10 hover:backdrop-blur-sm hover:text-amber-800",
                    "hover:shadow-md hover:shadow-amber-500/20",
                    "rounded-full border border-transparent hover:border-amber-400/30",
                    isActive("/") &&
                      "bg-amber-500/10 backdrop-blur-sm text-amber-800 font-semibold scale-[1.02] border-amber-400/30"
                  )}
                >
                  <div
                    className={cn(
                      "transition-colors",
                      isActive("/") && "text-amber-700"
                    )}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      isActive("/") && "text-amber-800"
                    )}
                  >
                    {t("home")}
                  </span>
                </Button>
              </Link>

              <Link href={getLocalizedHref("/workshop")}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 transition-all duration-300",
                    "flex items-center gap-2",
                    "text-sm font-medium text-orange-700/80",
                    "hover:bg-orange-500/10 hover:backdrop-blur-sm hover:text-orange-800",
                    "hover:shadow-md hover:shadow-orange-500/20",
                    "rounded-full border border-transparent hover:border-orange-400/30",
                    isActive("/workshop") &&
                      "bg-orange-500/10 backdrop-blur-sm text-orange-800 font-semibold scale-[1.02] border-orange-400/30"
                  )}
                >
                  <div
                    className={cn(
                      "transition-colors",
                      isActive("/workshop") && "text-orange-700"
                    )}
                  >
                    <Pencil className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      isActive("/workshop") && "text-orange-800"
                    )}
                  >
                    {t("workshop")}
                  </span>
                </Button>
              </Link>

              {/* 价格模型按钮 - 皇冠图标 */}
              <Link href={getLocalizedHref("/pricing")}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 transition-all duration-300",
                    "flex items-center gap-2",
                    "text-sm font-medium text-yellow-700/80",
                    "hover:bg-yellow-500/15 hover:backdrop-blur-sm hover:text-yellow-800",
                    "hover:shadow-md hover:shadow-yellow-500/25",
                    "rounded-full border border-transparent hover:border-yellow-400/30",
                    "relative overflow-hidden",
                    isActive("/pricing") &&
                      "bg-yellow-500/15 backdrop-blur-sm text-yellow-800 font-semibold scale-[1.02] border-yellow-400/30"
                  )}
                >
                  {/* 背景闪光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div
                    className={cn(
                      "transition-colors relative z-10",
                      isActive("/pricing") && "text-yellow-700"
                    )}
                  >
                    <Crown className="w-4 h-4 drop-shadow-sm" />
                  </div>
                  <span
                    className={cn(
                      "transition-colors relative z-10",
                      isActive("/pricing") && "text-yellow-800"
                    )}
                  >
                    升级专业版
                  </span>
                </Button>
              </Link>
            </nav>

            {/* 语言选择器 - 在所有设备上显示 */}
            <LanguagePicker />

            {/* 账户菜单 - 只在桌面端显示 */}
            <div className="hidden md:block">
              <AccountMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
