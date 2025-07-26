// src/i18n.ts - 更激进的缓存
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "zh", "ja", "ko"] as const;

// 全局消息缓存 - 生产环境永久缓存
const messageCache = new Map<string, Record<string, unknown>>();
const isProduction = process.env.NODE_ENV === "production";

// 预加载所有语言（生产环境）
if (isProduction) {
  Promise.all(
    locales.map(async (locale) => {
      try {
        const messages = (await import(`../messages/${locale}.json`)).default;
        messageCache.set(locale, messages);
      } catch (error) {
        console.warn(`Failed to preload ${locale}:`, error);
      }
    })
  );
}

export default getRequestConfig(async ({ locale = "en" }) => {
  const validLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : "en";

  // 生产环境：使用永久缓存
  if (isProduction && messageCache.has(validLocale)) {
    return {
      locale: validLocale,
      messages: messageCache.get(validLocale),
    };
  }

  // 开发环境或缓存未命中：动态加载
  if (!messageCache.has(validLocale)) {
    try {
      const messages = (await import(`../messages/${validLocale}.json`))
        .default;
      messageCache.set(validLocale, messages);
    } catch (error) {
      console.warn(`Failed to load ${validLocale}:`, error);
      // 回退
      const fallback = (await import(`../messages/en.json`)).default;
      messageCache.set(validLocale, fallback);
    }
  }

  return {
    locale: validLocale,
    messages: messageCache.get(validLocale),
  };
});
