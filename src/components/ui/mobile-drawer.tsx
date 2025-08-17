"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthClasses = {
  sm: "w-72",
  md: "w-80",
  lg: "w-96",
};

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = "md",
}: MobileDrawerProps) {
  return (
    <>
      {/* 遮罩层 - 使用主题色彩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden"
          style={{
            top: "4.375rem", // 70px header
          }}
          onClick={onClose}
        />
      )}

      {/* 抽屉 - 使用主题色彩 */}
      <div
        className={`fixed right-0 ${
          widthClasses[width]
        } bg-card/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 border-l border-border ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          top: "4.375rem", // 70px header
        }}
      >
        <div className="h-mobile-drawer flex flex-col">
          {/* Header - 使用主题色彩 */}
          <div className="flex-shrink-0 bg-gradient-to-r from-secondary/50 to-accent/30 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent/50 rounded-xl flex items-center justify-center border border-border">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>

          {/* 底部区域 - 使用主题色彩 */}
          {footer && (
            <div className="flex-shrink-0 p-4 pb-mobile-safe border-t border-border bg-gradient-to-r from-secondary/50 to-accent/30">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
