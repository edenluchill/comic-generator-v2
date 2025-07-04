import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/Header";
import MobileNavigationBar from "@/components/MobileNavigationBar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cache } from "react";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// 动态生成metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // 根据不同语言设置不同的标题
  const titles = {
    en: "Daily Memory Tales",
    zh: "日忆物语",
    ja: "デイリーメモリーテイルズ",
    ko: "일일 기억 이야기",
  };

  const descriptions = {
    en: "Capture beautiful moments in comic diary",
    zh: "记录每日美好的漫画日记",
    ja: "漫画日記で美しい瞬間を記録",
    ko: "만화 일기로 아름다운 순간을 기록",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

// 使用 React cache 优化
const getMessagesWithCache = cache(async (locale: string) => {
  return await getMessages({ locale });
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessagesWithCache(locale);

  return (
    <html lang={locale}>
      <head>
        {/* 添加多种格式的图标 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <MobileNavigationBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
