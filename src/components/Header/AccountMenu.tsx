"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { User, LogIn, Settings, Heart, LogOut } from "lucide-react";

export default function AccountMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tAccount = useTranslations("Account");

  // 模拟登录状态，后续集成 Supabase 时替换
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null
  );

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
    // TODO: 集成 Supabase 登录
    console.log("启动登录流程...");
    setShowMenu(false);
  };

  const handleLogout = () => {
    // TODO: 集成 Supabase 登出
    setIsLoggedIn(false);
    setUser(null);
    setShowMenu(false);
  };

  // 未登录状态：显示简约的登录按钮
  if (!isLoggedIn) {
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
        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <span className="hidden sm:inline">{user?.name || "用户"}</span>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/30 py-2 animate-fadeIn z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-amber-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-amber-900">
                  {user?.name || "用户名"}
                </p>
                <p className="text-xs text-amber-600">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-2">
            <button className="w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-50/60 transition-colors duration-200 flex items-center space-x-3">
              <Heart className="w-4 h-4" />
              <span className="text-sm">
                {tAccount("myWorks") || "我的作品"}
              </span>
            </button>
            <button className="w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-50/60 transition-colors duration-200 flex items-center space-x-3">
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
