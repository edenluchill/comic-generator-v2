"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { Home, Pencil, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export default function MobileNavigationBar() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const tAccount = useTranslations("Account");

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // 模拟登录状态
  const [isLoggedIn] = useState(false);

  const isActive = (path: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  const handleLogin = () => {
    console.log("启动登录流程...");
    setShowAccountMenu(false);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* 账户菜单 */}
      {showAccountMenu && !isLoggedIn && (
        <div ref={accountMenuRef} className="absolute bottom-full right-4 mb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/30 py-4 px-6 min-w-48">
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {tAccount("login") || "登录"}
            </Button>
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <div className="bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-md border-t border-amber-200/30">
        <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
          {/* 首页 */}
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-14 flex-col gap-1 rounded-2xl transition-all duration-300",
                isActive("/")
                  ? "bg-amber-500/15 text-amber-800 scale-105"
                  : "text-amber-700/70 hover:bg-amber-500/10 hover:text-amber-800"
              )}
            >
              <Home
                className={cn("w-6 h-6", isActive("/") && "text-amber-700")}
              />
              <span className="text-xs font-medium">{t("home")}</span>
            </Button>
          </Link>

          {/* 工作台 */}
          <Link href="/workshop" className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-14 flex-col gap-1 rounded-2xl transition-all duration-300",
                isActive("/workshop")
                  ? "bg-orange-500/15 text-orange-800 scale-105"
                  : "text-orange-700/70 hover:bg-orange-500/10 hover:text-orange-800"
              )}
            >
              <Pencil
                className={cn(
                  "w-6 h-6",
                  isActive("/workshop") && "text-orange-700"
                )}
              />
              <span className="text-xs font-medium">{t("workshop")}</span>
            </Button>
          </Link>

          {/* 账户 */}
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={cn(
                "w-full h-14 flex-col gap-1 rounded-2xl transition-all duration-300",
                showAccountMenu
                  ? "bg-amber-500/15 text-amber-800 scale-105"
                  : "text-amber-700/70 hover:bg-amber-500/10 hover:text-amber-800"
              )}
            >
              {isLoggedIn ? (
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              ) : (
                <User className="w-6 h-6" />
              )}
              <span className="text-xs font-medium">
                {isLoggedIn ? "我的" : tAccount("login")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
