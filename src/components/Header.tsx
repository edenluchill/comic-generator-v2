"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { Home, Pencil, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { lazy, memo } from "react";

const AccountMenu = lazy(() => import("./Header/AccountMenu"));
const LanguagePicker = lazy(() => import("./Header/LanguagePicker"));
const PremiumButton = lazy(() => import("./Header/PremiumButton"));

const Header = memo(function Header() {
  const pathname = usePathname();
  const { getLocalizedHref } = useLocalizedNavigation();
  const t = useTranslations("Navigation");
  const headerT = useTranslations("Header");

  const isActive = (path: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo区域 */}
          <Link
            href={getLocalizedHref("/")}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 border-2 border-rose-300/60 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:border-rose-400 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-rose-300/20">
                <Palette className="w-5 h-5 text-rose-500 group-hover:text-rose-600 transition-colors" />
              </div>
            </div>
            <div className="">
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {headerT("title")}
              </h1>
              <p className="text-xs text-rose-500/60 -mt-1">
                {headerT("subtitle")}
              </p>
            </div>
          </Link>

          {/* 右侧功能区 */}
          <div className="flex items-center gap-1">
            {/* Premium 升级按钮 */}
            <PremiumButton />

            {/* 桌面端导航链接 - 独立分组 */}
            <nav className="hidden md:flex items-center gap-1 backdrop-blur-sm rounded-lg p-1 border border-rose-200/30 shadow-sm">
              <Link href={getLocalizedHref("/")}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 transition-all duration-200",
                    "flex items-center gap-0.5",
                    "text-sm font-medium",
                    "hover:bg-pink-400/10 hover:text-rose-600",
                    isActive("/")
                      ? "bg-rose-400/15 text-rose-600 shadow-sm border-rose-200/40 hover:bg-rose-400/15 hover:text-rose-600"
                      : "text-rose-500/80 ",
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
                    "flex items-center gap-0.5",
                    "text-sm font-medium",
                    "hover:bg-pink-400/10 hover:text-rose-600",
                    isActive("/workshop")
                      ? "bg-rose-400/15 text-rose-600 shadow-sm border-rose-200/40 hover:bg-rose-400/15 hover:text-rose-600"
                      : "text-rose-500/80 ",
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
