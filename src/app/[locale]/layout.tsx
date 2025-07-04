import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/Header";
import MobileNavigationBar from "@/components/MobileNavigationBar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comic AI Generator - AI驱动的漫画创作工具",
  description: "使用AI技术将照片转换为漫画角色，创作独特的漫画故事",
};

// 添加消息缓存
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messagesCache = new Map<string, any>();

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 尝试从缓存获取消息
  let messages;
  if (messagesCache.has(locale)) {
    messages = messagesCache.get(locale);
  } else {
    messages = await getMessages({ locale });
    messagesCache.set(locale, messages);
  }

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 性能监控脚本
              window.pageLoadStart = performance.now();
              
              // 监控页面切换
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'navigation') {
                    console.log('🚀 Navigation Performance:', {
                      'DNS lookup': entry.domainLookupEnd - entry.domainLookupStart,
                      'Connection': entry.connectEnd - entry.connectStart,
                      'Response': entry.responseEnd - entry.responseStart,
                      'DOM parsing': entry.domContentLoadedEventEnd - entry.responseEnd,
                      'Total time': entry.loadEventEnd - entry.navigationStart
                    });
                  }
                }
              });
              observer.observe({ entryTypes: ['navigation'] });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <MobileNavigationBar />
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 页面加载完成时间
              window.addEventListener('load', () => {
                const loadTime = performance.now() - window.pageLoadStart;
                console.log('📊 Page Load Time:', loadTime.toFixed(2) + 'ms');
                
                // 检查是否超过500ms
                if (loadTime > 500) {
                  console.warn('⚠️ Page load time exceeds 500ms!');
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
