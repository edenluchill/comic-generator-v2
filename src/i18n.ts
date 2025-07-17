// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "zh", "ja", "ko"] as const;
type LocaleType = (typeof locales)[number];

// 预加载常用语言的翻译文件
const messageCache = new Map();

export default getRequestConfig(async ({ locale = "en" }) => {
  const validLocale = locales.includes(locale as LocaleType) ? locale : "en";

  // 使用缓存避免重复导入
  if (!messageCache.has(validLocale)) {
    const messages = (await import(`../messages/${validLocale}.json`)).default;
    messageCache.set(validLocale, messages);
  }

  return {
    locale: validLocale,
    messages: messageCache.get(validLocale),
  };
});
