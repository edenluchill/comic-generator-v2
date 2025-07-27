import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  // ✅ 生产环境更需要精确匹配，减少服务器负载
  matcher: [
    // 只匹配实际需要国际化的路径
    "/",
    "/workshop",
    "/pricing",
    "/profile",
    "/login",
    // 动态语言路径
    "/(zh|en|ja|ko)/:path*",
  ],
};
