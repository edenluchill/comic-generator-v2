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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 等待 params 解析
  const { locale } = await params;

  // 获取当前语言的翻译消息
  const messages = await getMessages({ locale });

  console.log("locale", locale);
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <MobileNavigationBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
