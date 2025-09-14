// src/app/[locale]/client-layout.tsx
"use client";

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DataStreamProvider } from "@/components/providers/data-stream-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { ComicStreamHandler } from "@/components/providers/comic-stream-handler";

// 延迟加载重型组件
const Header = lazy(() => import("@/components/Header"));
const MobileNavigationBar = lazy(
  () => import("@/components/MobileNavigationBar")
);
const PageTransition = lazy(() => import("@/components/PageTransition"));
const PagePreloader = lazy(() => import("@/components/PagePreloader"));

// 轻量级 fallback
const HeaderFallback = () => (
  <div className="h-16 bg-amber-50 dark:bg-gray-900 border-b animate-pulse" />
);

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
    <ReduxProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        themes={["light", "dark", "warm", "ai"]}
        enableSystem={false}
        disableTransitionOnChange
      >
        <DataStreamProvider>
          <ComicStreamHandler />
          <QueryClientProvider client={queryClient}>
            {/* 页面预加载器 */}
            <Suspense fallback={null}>
              <PagePreloader />
            </Suspense>
            <Suspense fallback={<HeaderFallback />}>
              <Header />
            </Suspense>

            {/* 主内容区域 - 使用全屏安全高度 */}
            <main className="h-screen-safe">
              <Suspense
                fallback={
                  <div className="w-full h-full animate-pulse bg-background/50" />
                }
              >
                <PageTransition>{children}</PageTransition>
              </Suspense>
            </main>

            <Suspense fallback={<div className="h-16" />}>
              <MobileNavigationBar />
            </Suspense>
          </QueryClientProvider>
        </DataStreamProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
