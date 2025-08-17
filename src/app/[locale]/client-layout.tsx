// src/app/[locale]/client-layout.tsx
"use client";

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";

// 延迟加载重型组件
const Header = lazy(() => import("@/components/Header"));
const MobileNavigationBar = lazy(
  () => import("@/components/MobileNavigationBar")
);

// 轻量级 fallback
const HeaderFallback = () => (
  <div className="h-16 bg-amber-50 dark:bg-gray-900 border-b animate-pulse" />
);

// 移除 StoreProvider，只保留 QueryClientProvider
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>

        {/* 主内容区域 - 添加底部安全区域 */}
        <main className="pb-mobile-safe">{children}</main>

        <Suspense fallback={<div className="h-16" />}>
          <MobileNavigationBar />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
