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
      const localizedPath = path.startsWith("/")
        ? `/${locale}${path}`
        : `/${locale}/${path}`;
      router.push(localizedPath);
    },
    [locale, router]
  );

  const getLocalizedHref = useCallback(
    (path: string) => {
      return path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`;
    },
    [locale]
  );

  const replace = useCallback(
    (path: string) => {
      const localizedPath = path.startsWith("/")
        ? `/${locale}${path}`
        : `/${locale}/${path}`;
      router.replace(localizedPath);
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
