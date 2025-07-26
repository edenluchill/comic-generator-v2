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
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {/* 首页 */}
          <Link href={getLocalizedHref("/")} className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 flex-col gap-1.5 rounded-xl transition-all duration-200 ease-out",
                isActive("/")
                  ? "bg-amber-500/10 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:bg-amber-100/50 hover:text-amber-700"
              )}
            >
              <div
                className={cn(
                  "relative transition-all duration-200",
                  isActive("/") && "scale-110"
                )}
              >
                <Home className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">{t("home")}</span>
            </Button>
          </Link>

          {/* 工作台 */}
          <Link href={getLocalizedHref("/workshop")} className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 flex-col gap-1.5 rounded-xl transition-all duration-200 ease-out",
                isActive("/workshop")
                  ? "bg-orange-500/10 text-orange-700 shadow-sm"
                  : "text-gray-600 hover:bg-orange-100/50 hover:text-orange-700"
              )}
            >
              <div
                className={cn(
                  "relative transition-all duration-200",
                  isActive("/workshop") && "scale-110"
                )}
              >
                <Pencil className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">{t("workshop")}</span>
            </Button>
          </Link>

          {/* 账户 */}
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={handleAccountClick}
              className={cn(
                "w-full h-16 flex-col gap-1.5 rounded-xl transition-all duration-200 ease-out",
                isAccountActive
                  ? "bg-amber-500/10 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:bg-amber-100/50 hover:text-amber-700"
              )}
            >
              <div
                className={cn(
                  "relative transition-all duration-200",
                  isAccountActive && "scale-110"
                )}
              >
                {/* 头像区域 */}
                {isLoggedIn ? (
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* 文字区域 - 皇冠在这里显示 */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">
                  {isLoggedIn ? tAccount("my") : tAccount("login")}
                </span>
                {isPremium && (
                  <div className="flex items-center justify-center w-3 h-3  rounded-full shadow-sm border border-yellow-200/50">
                    <Crown className="w-1.5 h-1.5 text-amber-500" />
                  </div>
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
