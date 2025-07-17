"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { useTranslations } from "@/hooks/useTranslations";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { navigate } = useLocalizedNavigation();
  const pathname = usePathname();
  const t = useTranslations("Common");

  useEffect(() => {
    if (!loading && !user) {
      // 保存当前页面到 sessionStorage
      sessionStorage.setItem("returnUrl", pathname);
      // 重定向到登录页面
      navigate("/login");
    }
  }, [loading, user, navigate, pathname]);

  // 显示加载状态
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-amber-700">
              {t("loading") || "Loading..."}
            </p>
          </div>
        </div>
      )
    );
  }

  // 如果用户未登录，显示重定向状态
  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-amber-700">正在重定向到登录页面...</p>
          </div>
        </div>
      )
    );
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
}
