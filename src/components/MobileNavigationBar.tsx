"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { Home, Pencil, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

export default function MobileNavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { getLocalizedHref } = useLocalizedNavigation();
  const t = useTranslations("Navigation");
  const tAccount = useTranslations("Account");
  const { user, profile, loading } = useAuth();

  const isActive = (path: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    if (path === "/" && pathWithoutLocale === "/") return true;
    if (path !== "/" && pathWithoutLocale.startsWith(path)) return true;
    return false;
  };

  const handleAccountClick = () => {
    const isLoggedIn = !loading && user && profile;
    if (isLoggedIn) {
      router.push(getLocalizedHref("/profile"));
    } else {
      router.push(getLocalizedHref("/login"));
    }
  };

  const isLoggedIn = !loading && user && profile;
  const isAccountActive = isActive("/profile") || isActive("/login");
  const isPremium = profile?.subscription_tier === "premium";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
          {/* 首页 */}
          <Link href={getLocalizedHref("/")} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-14 flex-col gap-1 hover:bg-transparent transition-all duration-200 ease-out"
            >
              <div
                className={cn(
                  "relative transition-all duration-300 ease-out",
                  isActive("/") ? "scale-110" : "scale-100"
                )}
              >
                <Home
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive("/") ? "text-amber-600" : "text-gray-500"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive("/") ? "text-amber-600" : "text-gray-500"
                )}
              >
                {t("home")}
              </span>
            </Button>
          </Link>

          {/* 工作台 */}
          <Link href={getLocalizedHref("/workshop")} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-14 flex-col gap-1 hover:bg-transparent transition-all duration-200 ease-out"
            >
              <div
                className={cn(
                  "relative transition-all duration-300 ease-out",
                  isActive("/workshop") ? "scale-110" : "scale-100"
                )}
              >
                <Pencil
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    isActive("/workshop") ? "text-orange-600" : "text-gray-500"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive("/workshop") ? "text-orange-600" : "text-gray-500"
                )}
              >
                {t("workshop")}
              </span>
            </Button>
          </Link>

          {/* 账户 */}
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={handleAccountClick}
              className="w-full h-14 flex-col gap-1 hover:bg-transparent transition-all duration-200 ease-out"
            >
              <div
                className={cn(
                  "relative transition-all duration-300 ease-out",
                  isAccountActive ? "scale-110" : "scale-100"
                )}
              >
                {/* 头像区域 */}
                {isLoggedIn ? (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                      isAccountActive
                        ? "bg-gradient-to-br from-amber-500 to-orange-500"
                        : "bg-gradient-to-br from-gray-400 to-gray-500"
                    )}
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <User
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      isAccountActive ? "text-amber-600" : "text-gray-500"
                    )}
                  />
                )}
              </div>

              {/* 文字区域 - 皇冠在这里显示 */}
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium transition-colors duration-200",
                    isAccountActive ? "text-amber-600" : "text-gray-500"
                  )}
                >
                  {isLoggedIn ? tAccount("my") : tAccount("login")}
                </span>
                {isPremium && (
                  <Crown
                    className={cn(
                      "w-3 h-3 transition-all duration-200",
                      isAccountActive ? "text-amber-500" : "text-gray-400"
                    )}
                  />
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
