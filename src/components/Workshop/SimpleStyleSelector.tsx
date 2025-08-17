"use client";

import { useState, useEffect } from "react";
import { CharacterStyle } from "@/types/flux";
import { createFluxCharacterGenerator } from "@/lib/flux-generator";

interface SimpleStyleSelectorProps {
  selectedStyle: CharacterStyle;
  onStyleChange: (style: CharacterStyle) => void;
  disabled?: boolean;
}

export default function SimpleStyleSelector({
  selectedStyle,
  onStyleChange,
  disabled = false,
}: SimpleStyleSelectorProps) {
  const [availableStyles, setAvailableStyles] = useState<
    Array<{ key: CharacterStyle; name: string; description: string }>
  >([]);

  useEffect(() => {
    // 获取可用的风格
    const generator = createFluxCharacterGenerator();
    setAvailableStyles(generator.getAvailableStyles());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎨</span>
        <h3 className="text-lg font-semibold text-foreground">选择生成风格</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableStyles.map((style) => (
          <button
            key={style.key}
            onClick={() => !disabled && onStyleChange(style.key)}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group ${
              selectedStyle === style.key
                ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <div className="font-medium text-sm">{style.name}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground/80">
              {style.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
