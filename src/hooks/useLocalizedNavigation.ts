"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCallback } from "react";

export function useLocalizedNavigation() {
  const router = useRouter();
  const locale = useLocale();

  // 使用 useCallback 优化性能
  const navigate = useCallback(
    (path: string) => {
      // 检查路径是否已经包含 locale 前缀
      const localePrefix = `/${locale}`;
      if (path.startsWith(localePrefix)) {
        // 如果已经包含 locale 前缀，直接使用
        router.push(path);
      } else {
        // 否则添加 locale 前缀
        const localizedPath = path.startsWith("/")
          ? `/${locale}${path}`
          : `/${locale}/${path}`;
        router.push(localizedPath);
      }
    },
    [locale, router]
  );

  const getLocalizedHref = useCallback(
    (path: string) => {
      // 检查路径是否已经包含 locale 前缀
      const localePrefix = `/${locale}`;
      if (path.startsWith(localePrefix)) {
        return path;
      }
      return path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`;
    },
    [locale]
  );

  const replace = useCallback(
    (path: string) => {
      // 检查路径是否已经包含 locale 前缀
      const localePrefix = `/${locale}`;
      if (path.startsWith(localePrefix)) {
        router.replace(path);
      } else {
        const localizedPath = path.startsWith("/")
          ? `/${locale}${path}`
          : `/${locale}/${path}`;
        router.replace(localizedPath);
      }
    },
    [locale, router]
  );

  return {
    navigate,
    getLocalizedHref,
    replace,
    locale,
    router,
  };
}
