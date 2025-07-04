// 优化中间件
import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
  alternateLinks: false,

  // 性能优化：预定义路径，避免运行时解析
  pathnames: {
    "/": "/",
    "/workshop": "/workshop",
    "/profile": "/profile",
    "/login": "/login",
    "/auth/callback": "/auth/callback",
    "/auth/error": "/auth/error",
  },
});

export const config = {
  matcher: [
    // 优化 matcher，减少不必要的中间件执行
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$).*)",
  ],
};
