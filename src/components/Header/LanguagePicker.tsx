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
          "text-sm font-medium text-muted-foreground",
          "hover:bg-primary/10 hover:text-foreground",
          "hover:shadow-md hover:shadow-primary/20",
          "rounded-full border border-transparent hover:border-primary/30"
        )}
      >
        <Languages className="w-4 h-4" />
        {/* <span className="text-sm">
          {languages.find((lang) => lang.code === currentLocale)?.flag}
        </span> */}
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-popover/95 backdrop-blur-md rounded-2xl shadow-xl border border-border py-2 animate-fadeIn z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-accent transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                {/* <span className="text-lg">{lang.flag}</span> */}
                <span className="font-medium text-popover-foreground group-hover:text-accent-foreground">
                  {lang.name}
                </span>
              </div>
              {currentLocale === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
