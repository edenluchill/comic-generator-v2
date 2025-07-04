"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn, Settings, Heart, LogOut, Crown } from "lucide-react";

export default function AccountMenu() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut } = useAuth();
  const tAccount = useTranslations("Account");

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-amber-100 animate-pulse"></div>
    );
  }

  // 未登录状态：显示简约的登录按钮
  if (!user || !profile) {
    return (
      <Button
        onClick={handleLogin}
        variant="ghost"
        size="sm"
        className="h-10 px-4 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-amber-700/80 hover:bg-amber-500/10 hover:backdrop-blur-sm hover:text-amber-800 hover:shadow-md hover:shadow-amber-500/20 rounded-full border border-transparent hover:border-amber-400/30 hover:scale-[1.02]"
      >
        <LogIn className="w-4 h-4" />
        <span>{tAccount("login") || "登录"}</span>
      </Button>
    );
  }

  // 已登录状态：显示用户菜单
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="h-10 px-4 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-amber-700/80 hover:bg-amber-500/10 hover:backdrop-blur-sm hover:text-amber-800 hover:shadow-md hover:shadow-amber-500/20 rounded-full border border-transparent hover:border-amber-400/30 hover:scale-[1.02]"
      >
        <div className="relative">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.name || "User"}
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
          {profile.subscription_status === "premium" && (
            <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
          )}
        </div>
        <span className="hidden sm:inline">
          {profile.name || tAccount("user")}
        </span>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/30 py-2 animate-fadeIn z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-amber-100/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                {profile.subscription_status === "premium" && (
                  <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-amber-900 truncate">
                    {profile.name || tAccount("username")}
                  </p>
                  {profile.subscription_status === "premium" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-600 truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {/* 使用统计 */}
          {profile.usage_stats && (
            <div className="px-4 py-2 border-b border-amber-100/50">
              <div className="text-xs text-amber-600">
                {tAccount("generatedThisMonth")}:{" "}
                {profile.usage_stats.images_generated || 0}
              </div>
              <div className="text-xs text-amber-500">
                {profile.subscription_status === "premium"
                  ? tAccount("unlimited")
                  : `${tAccount("remaining")}: ${
                      50 - (profile.usage_stats.images_generated || 0)
                    }`}
              </div>
            </div>
          )}

          {/* 菜单项 */}
          <div className="py-2">
            <button className="w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-50/60 transition-colors duration-200 flex items-center space-x-3">
              <Heart className="w-4 h-4" />
              <span className="text-sm">
                {tAccount("myWorks") || "My Works"}
              </span>
              {profile.usage_stats && (
                <span className="ml-auto text-xs text-amber-500">
                  {profile.usage_stats.stories_created || 0}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                router.push("/profile");
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-50/60 transition-colors duration-200 flex items-center space-x-3"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{tAccount("settings") || "设置"}</span>
            </button>
            <div className="border-t border-amber-100/50 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-orange-600 hover:bg-orange-50/60 transition-colors duration-200 flex items-center space-x-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{tAccount("logout") || "登出"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
