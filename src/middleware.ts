import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  // 支持的语言列表
  locales,

  // 默认语言
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  // 匹配所有路径，除了api路由和静态文件
  matcher: [
    "/",
    "/(zh|ja|ko|en)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
