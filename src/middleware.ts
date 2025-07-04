import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "zh", "ja", "ko"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
