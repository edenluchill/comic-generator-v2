"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export default function LanguagePicker() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = (langCode: string) => {
    // 更严格的正则，只匹配支持的语言代码
    const pathWithoutLocale = pathname.replace(/^\/(zh|en|ja|ko)/, "") || "/";
    const newPath = `/${langCode}${pathWithoutLocale}`;

    router.push(newPath);
    setShowMenu(false);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "h-10 px-3 transition-all duration-300",
          "flex items-center gap-2",
          "text-sm font-medium text-amber-700/80",
          "hover:bg-amber-500/10 hover:backdrop-blur-sm hover:text-amber-800",
          "hover:shadow-md hover:shadow-amber-500/20",
          "rounded-full border border-transparent hover:border-amber-400/30"
        )}
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm">
          {languages.find((lang) => lang.code === currentLocale)?.flag}
        </span>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/30 py-2 animate-fadeIn z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-amber-50/60 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                {/* <span className="text-lg">{lang.flag}</span> */}
                <span className="font-medium text-amber-800 group-hover:text-amber-900">
                  {lang.name}
                </span>
              </div>
              {currentLocale === lang.code && (
                <Check className="w-4 h-4 text-amber-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
