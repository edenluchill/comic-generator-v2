"use client";

import { StyleTransferInterface } from "@/components/StyleTransfer";
import { useTranslations } from "@/hooks/useTranslations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StyleTransferPage() {
  const t = useTranslations("StyleTransfer");
  const { getLocalizedHref } = useLocalizedNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={getLocalizedHref("/")}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToHome")}
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Style Transfer Interface */}
        <div className="w-full">
          <StyleTransferInterface 
            onComplete={(result) => {
              console.log("Style transfer completed:", result);
            }}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t("features.title")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("features.dualUpload.title")}</h3>
              <p className="text-gray-600">{t("features.dualUpload.description")}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("features.realtime.title")}</h3>
              <p className="text-gray-600">{t("features.realtime.description")}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("features.credits.title")}</h3>
              <p className="text-gray-600">{t("features.credits.description")}</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t("howItWorks.title")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step1.title")}</h3>
              <p className="text-gray-600 text-sm">{t("howItWorks.step1.description")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step2.title")}</h3>
              <p className="text-gray-600 text-sm">{t("howItWorks.step2.description")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step3.title")}</h3>
              <p className="text-gray-600 text-sm">{t("howItWorks.step3.description")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">{t("howItWorks.step4.title")}</h3>
              <p className="text-gray-600 text-sm">{t("howItWorks.step4.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
