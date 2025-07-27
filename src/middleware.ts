import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  // 支持的语言列表
  locales,

  // 默认语言
  defaultLocale: "en",

  // 修改为 "always" - 所有语言都显示前缀，包括默认语言
  localePrefix: "always",
});

export const config = {
  // 匹配所有路径除了 API 路由、静态文件等
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
