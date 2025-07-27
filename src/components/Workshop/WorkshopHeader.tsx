"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ActionButton {
  icon: LucideIcon;
  text: string;
  shortText: string; // 中等屏幕简化文字
  onClick: () => void;
  disabled?: boolean;
}

interface WorkshopHeaderProps {
  leftAction?: ActionButton;
  title?: string | ReactNode;
  rightAction?: ActionButton;
  mounted?: boolean;
  className?: string;
}

export default function WorkshopHeader({
  leftAction,
  title,
  rightAction,
  mounted = true,
  className = "",
}: WorkshopHeaderProps) {
  const ActionButton = ({
    action,
    align = "left",
  }: {
    action: ActionButton;
    align?: "left" | "right";
  }) => {
    const Icon = action.icon;

    return (
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`
          flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg 
          transition-all duration-300 text-sm
          ${
            action.disabled
              ? "text-gray-400 cursor-not-allowed opacity-50"
              : "text-amber-600 hover:text-amber-700 hover:bg-white/50 active:scale-95"
          }
          ${align === "right" ? "flex-row-reverse" : "flex-row"}
        `}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {/* 大屏幕显示完整文字 */}
        <span className="hidden md:inline">{action.text}</span>
        {/* 中等屏幕显示简化文字 */}
        <span className="hidden sm:inline md:hidden">{action.shortText}</span>
        {/* 小屏幕只显示icon，文字隐藏 */}
      </button>
    );
  };

  return (
    <div
      className={`
        flex items-center justify-between mb-4 
        transition-all duration-1000 
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        ${className}
      `}
    >
      {/* 左侧：返回按钮区域 */}
      <div className="flex-1 flex justify-start">
        {leftAction && <ActionButton action={leftAction} align="left" />}
      </div>

      {/* 中间：标题区域 */}
      <div className="flex-1 px-2 sm:px-4">
        <div className="text-center">
          {title && typeof title === "string" ? (
            <h1 className="text-amber-700 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-tight">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>
      </div>

      {/* 右侧：前进按钮区域 */}
      <div className="flex-1 flex justify-end">
        {rightAction && <ActionButton action={rightAction} align="right" />}
      </div>
    </div>
  );
}

// 导出一些常用的配置
export const createBackAction = (
  icon: LucideIcon,
  text: string,
  shortText: string,
  onClick: () => void
): ActionButton => ({
  icon,
  text,
  shortText,
  onClick,
});

export const createForwardAction = (
  icon: LucideIcon,
  text: string,
  shortText: string,
  onClick: () => void,
  disabled?: boolean
): ActionButton => ({
  icon,
  text,
  shortText,
  onClick,
  disabled,
});
