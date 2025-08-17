"use client";

import * as React from "react";
import { Moon, Sun, Palette, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "粉色主题", icon: Palette, color: "text-pink-500" },
  { value: "dark", label: "深色主题", icon: Moon, color: "text-slate-500" },
  { value: "warm", label: "温暖主题", icon: Sun, color: "text-orange-500" },
  { value: "ai", label: "AI主题", icon: Zap, color: "text-blue-500" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // 避免水合不匹配
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 点击外部关闭菜单
  React.useEffect(() => {
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

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <div className="w-4 h-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0 hover:bg-primary/10 transition-all duration-200"
        onClick={() => setShowMenu(!showMenu)}
      >
        <CurrentIcon
          className={cn(
            "w-4 h-4 transition-all duration-200",
            currentTheme.color
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-popover/95 backdrop-blur-md rounded-2xl shadow-xl border border-border py-2 animate-fadeIn z-50">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;

            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setShowMenu(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center space-x-3 hover:bg-accent transition-all duration-200 group",
                  isActive && "bg-accent/50"
                )}
              >
                <Icon
                  className={cn("w-4 h-4 transition-colors", themeOption.color)}
                />
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent-foreground"
                      : "text-popover-foreground group-hover:text-accent-foreground"
                  )}
                >
                  {themeOption.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
