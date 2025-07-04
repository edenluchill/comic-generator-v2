// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "zh", "ja", "ko"] as const;

export default getRequestConfig(async ({ locale = "en" }) => {
  // 简单的 locale 验证
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validLocale = locales.includes(locale as any) ? locale : "en";

  // 直接动态导入，让 Next.js 和 React 处理缓存
  const messages = (await import(`../messages/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
  };
});
