"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

// 预加载关键页面
const PRELOAD_ROUTES = ["/", "/chat", "/workshop", "/profile"];

export default function PagePreloader() {
  const router = useRouter();
  const { getLocalizedHref } = useLocalizedNavigation();

  useEffect(() => {
    // 预加载关键路由
    const preloadRoutes = async () => {
      for (const route of PRELOAD_ROUTES) {
        try {
          const localizedRoute = getLocalizedHref(route);
          router.prefetch(localizedRoute);
        } catch (error) {
          console.log(`Failed to prefetch ${route}:`, error);
        }
      }
    };

    // 延迟预加载，避免阻塞初始渲染
    const timeoutId = setTimeout(preloadRoutes, 1000);

    return () => clearTimeout(timeoutId);
  }, [router, getLocalizedHref]);

  // 鼠标悬停时预加载
  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if target is an Element and has the closest method
      if (!target || !(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link && link.href.includes(window.location.origin)) {
        const href = new URL(link.href).pathname;
        router.prefetch(href);
      }
    };

    // 添加全局鼠标悬停监听
    document.addEventListener("mouseenter", handleMouseEnter, {
      capture: true,
    });

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, {
        capture: true,
      });
    };
  }, [router]);

  return null;
}
