"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { Home, Pencil, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
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
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  const isLoggedIn = !loading && user && profile;
  const isAccountActive = isActive("/profile") || isActive("/login");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* 优雅的底部导航栏 */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
          {/* 首页 */}
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 flex-col gap-1.5 rounded-xl transition-all duration-200 ease-out",
                isActive("/")
                  ? "bg-amber-500/10 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-800"
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
          <Link href="/workshop" className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-16 flex-col gap-1.5 rounded-xl transition-all duration-200 ease-out",
                isActive("/workshop")
                  ? "bg-orange-500/10 text-orange-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-800"
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
                  ? "bg-violet-500/10 text-violet-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-800"
              )}
            >
              <div
                className={cn(
                  "relative transition-all duration-200",
                  isAccountActive && "scale-110"
                )}
              >
                {isLoggedIn ? (
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 border-2 border-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">
                {isLoggedIn ? tAccount("my") : tAccount("login")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
