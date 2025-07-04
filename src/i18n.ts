// 优化 i18n 配置
import {
  getRequestConfig,
  GetRequestConfigParams,
  RequestConfig,
} from "next-intl/server";

export const locales: string[] = ["en", "zh", "ja", "ko"];

// 使用 Map 而不是普通对象，性能更好
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translationsCache = new Map<string, any>();

// 预加载所有翻译文件
const loadTranslations = async () => {
  const translations = await Promise.all([
    import("../messages/en.json").then((m) => ({
      locale: "en",
      messages: m.default,
    })),
    import("../messages/zh.json").then((m) => ({
      locale: "zh",
      messages: m.default,
    })),
    import("../messages/ja.json").then((m) => ({
      locale: "ja",
      messages: m.default,
    })),
    import("../messages/ko.json").then((m) => ({
      locale: "ko",
      messages: m.default,
    })),
  ]);

  translations.forEach(({ locale, messages }) => {
    translationsCache.set(locale, messages);
  });
};

// 启动时预加载
loadTranslations().catch(console.error);

// 优化的 locale 验证
const isValidLocale = (locale: string): boolean => {
  return locales.includes(locale);
};

export default getRequestConfig(
  async ({ locale = "en" }: GetRequestConfigParams): Promise<RequestConfig> => {
    // 性能监控
    const start = performance.now();

    const validLocale = isValidLocale(locale) ? locale : "en";

    // 从缓存获取翻译
    let messages = translationsCache.get(validLocale);

    if (!messages) {
      // 如果缓存未命中，动态加载
      const translations = {
        en: () => import("../messages/en.json"),
        zh: () => import("../messages/zh.json"),
        ja: () => import("../messages/ja.json"),
        ko: () => import("../messages/ko.json"),
      };

      messages = (
        await translations[validLocale as keyof typeof translations]()
      ).default;
      translationsCache.set(validLocale, messages);
    }

    const duration = performance.now() - start;
    if (duration > 50) {
      console.warn(
        `🐌 i18n loading took ${duration.toFixed(
          2
        )}ms for locale: ${validLocale}`
      );
    }

    return {
      locale: validLocale,
      messages,
    };
  }
);
