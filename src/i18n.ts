import {
  getRequestConfig,
  GetRequestConfigParams,
  RequestConfig,
} from "next-intl/server";

// 支持的语言

export const locales: string[] = ["en", "zh", "ja", "ko"];

export default getRequestConfig(
  async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
    // 如果语言不支持，fallback到英文
    if (!locale) {
      return {
        locale: "en",
        messages: (await import(`../messages/en.json`)).default,
      };
    }
    const validLocale = locales.includes(locale.toLowerCase()) ? locale : "en";

    return {
      locale: validLocale,
      messages: (await import(`../messages/${validLocale}.json`)).default,
    };
  }
);
