"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { User, LogIn, Settings, LogOut, Crown } from "lucide-react";
import { HorizontalLoader } from "../ui/loading";

export default function AccountMenu() {
  const { getLocalizedHref, navigate } = useLocalizedNavigation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut } = useAuth();
  const tAccount = useTranslations("Account");
  const tCommon = useTranslations("Common");

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

  const handleLogout = async () => {
    try {
      await signOut();
      setShowMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <HorizontalLoader
        message={tCommon("loading")}
        color="primary"
        size="sm"
      />
    );
  }

  // 未登录状态：显示简约的登录按钮 - 使用主题色彩
  if (!user || !profile) {
    return (
      <Link href={getLocalizedHref("/login")}>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-4 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-primary/80 hover:bg-primary/10 hover:backdrop-blur-sm hover:text-primary hover:shadow-md hover:shadow-primary/20 rounded-full border border-transparent hover:border-primary/30 hover:scale-[1.02]"
        >
          <LogIn className="w-4 h-4" />
          <span>{tAccount("login") || "登录"}</span>
        </Button>
      </Link>
    );
  }

  const isPremium = profile.subscription_tier === "premium";

  // 已登录状态：显示用户菜单 - 使用主题色彩
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="h-10 px-4 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-primary/80 hover:bg-primary/10 hover:backdrop-blur-sm hover:text-primary hover:shadow-md hover:shadow-primary/20 rounded-full border border-transparent hover:border-primary/30 hover:scale-[1.02]"
      >
        {/* 头像区域 - 使用主题色彩 */}
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name || "User"}
            width={20}
            height={20}
            className="rounded-full border border-primary/20"
            priority
          />
        ) : (
          <div className="w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-primary-foreground" />
          </div>
        )}

        {/* 用户名和皇冠区域 */}
        <div className="hidden sm:flex items-center gap-1">
          <span>{profile.full_name || tAccount("user")}</span>
          {isPremium && (
            <div className="flex items-center justify-center w-4 h-4">
              <Crown className="w-2.5 h-2.5 text-primary drop-shadow-sm" />
            </div>
          )}
        </div>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-border py-2 animate-fadeIn z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* 头像 - 使用主题色彩 */}
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full border border-primary/20"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <div className="flex-1">
                {/* 用户名和Premium标识在同一行 */}
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {profile.full_name || tAccount("username")}
                  </p>
                  {isPremium && <Crown className="w-3 h-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {/* Credit余额显示 - 使用主题色彩 */}
          <div className="px-4 py-2 border-b border-border">
            <div className="text-xs text-muted-foreground">
              积分:{" "}
              <span className="text-primary font-medium">
                {profile.current_credits}
              </span>
            </div>
          </div>

          {/* 菜单项 - 使用主题色彩 */}
          <div className="py-2">
            <Link
              href={getLocalizedHref("/profile")}
              onClick={() => setShowMenu(false)}
              className="w-full px-4 py-2 text-left text-foreground hover:bg-secondary/50 hover:text-primary transition-colors duration-200 flex items-center space-x-3"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">
                {tAccount("profile") || "个人资料"}
              </span>
            </Link>
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 flex items-center space-x-3"
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
