import { useTranslations as useNextIntlTranslations } from "next-intl";

// 全局翻译hook
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

// 导航翻译hook
export function useNavigationTranslations() {
  return useNextIntlTranslations("Navigation");
}

// 通用翻译hook
export function useCommonTranslations() {
  return useNextIntlTranslations("Common");
}
