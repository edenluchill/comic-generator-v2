"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LayoutMode } from "@/types/diary";
import { LAYOUT_OPTIONS } from "@/lib/constants/comic-display.constants";

interface LayoutPickerProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  disabled?: boolean;
}

export default function LayoutPicker({
  layoutMode,
  onLayoutModeChange,
  disabled = false,
}: LayoutPickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const currentLayout = LAYOUT_OPTIONS.find((opt) => opt.value === layoutMode);
  const CurrentIcon = currentLayout?.icon || LAYOUT_OPTIONS[0].icon;

  const handleClickOutside = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
  };

  return (
    <>
      {/* 点击外部关闭dropdown的遮罩 */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
      )}

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
          className="flex items-center justify-between gap-3 px-3 py-2 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/30 transition-all duration-200 text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4" />
            {currentLayout?.label}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
            {LAYOUT_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = layoutMode === option.value;
              const isFirst = index === 0;
              const isLast = index === LAYOUT_OPTIONS.length - 1;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onLayoutModeChange(option.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground hover:bg-secondary/50 hover:text-primary"
                  } ${isFirst ? "rounded-t-lg" : ""} ${
                    isLast ? "rounded-b-lg" : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
