"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ComicFormat } from "@/types/diary";
import { FORMAT_OPTIONS } from "@/lib/constants/comic-display.constants";
import { COMIC_DISPLAY_STYLES } from "@/lib/styles/comic-display.styles";

interface FormatPickerProps {
  format: ComicFormat;
  onFormatChange: (format: ComicFormat) => void;
  disabled?: boolean;
}

export default function FormatPicker({
  format,
  onFormatChange,
  disabled = false,
}: FormatPickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const currentFormat = FORMAT_OPTIONS.find((opt) => opt.value === format);
  const CurrentIcon = currentFormat?.icon || FORMAT_OPTIONS[0].icon;

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
          className={COMIC_DISPLAY_STYLES.dropdown.button}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4" />
            {currentFormat?.label}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDropdown && (
          <div className={COMIC_DISPLAY_STYLES.dropdown.menu}>
            {FORMAT_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = format === option.value;
              const isFirst = index === 0;
              const isLast = index === FORMAT_OPTIONS.length - 1;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onFormatChange(option.value);
                    setShowDropdown(false);
                  }}
                  className={`${COMIC_DISPLAY_STYLES.dropdown.item} ${
                    isSelected
                      ? COMIC_DISPLAY_STYLES.dropdown.itemSelected
                      : COMIC_DISPLAY_STYLES.dropdown.itemDefault
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
