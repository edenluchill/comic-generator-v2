import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";

// 1. 简单的Spinner组件 - 适用于按钮、小区域loading
const spinnerVariants = cva("animate-spin rounded-full border-2", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    color: {
      primary: "border-amber-200 border-t-amber-500",
      secondary: "border-blue-200 border-t-blue-500",
      white: "border-gray-300 border-t-white",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export interface SimpleSpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof spinnerVariants> {}

export const SimpleSpinner = React.forwardRef<
  HTMLDivElement,
  SimpleSpinnerProps
>(({ className, size, color, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, color }), className)}
      {...props}
    />
  );
});
SimpleSpinner.displayName = "SimpleSpinner";

// 2. 带图标的Loader组件 - 适用于内容区域loading
const loaderVariants = cva("flex flex-col items-center justify-center gap-2", {
  variants: {
    size: {
      sm: "py-4",
      md: "py-6",
      lg: "py-8",
      xl: "py-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  message?: string;
  iconSize?: number;
  color?: "primary" | "secondary";
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    { className, size, message, iconSize = 24, color = "primary", ...props },
    ref
  ) => {
    const colorClasses = {
      primary: "text-amber-600",
      secondary: "text-blue-600",
    };

    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ size }), className)}
        {...props}
      >
        <div
          className={`border-2 border-${
            color === "primary" ? "amber" : "blue"
          }-200 rounded-xl p-3 flex items-center justify-center`}
        >
          <Loader2
            className={cn("animate-spin", colorClasses[color])}
            size={iconSize}
          />
        </div>
        {message && (
          <p className={cn("text-sm font-medium", colorClasses[color])}>
            {message}
          </p>
        )}
      </div>
    );
  }
);
Loader.displayName = "Loader";

// 3. 进度Spinner组件 - 适用于生成过程、进度显示
export interface ProgressSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number;
  message?: string;
  size?: "md" | "lg";
  color?: "primary" | "secondary";
  showProgressBar?: boolean;
  showPercentage?: boolean;
}

export const ProgressSpinner = React.forwardRef<
  HTMLDivElement,
  ProgressSpinnerProps
>(
  (
    {
      className,
      progress = 0,
      message,
      size = "lg",
      color = "primary",
      showProgressBar = true,
      showPercentage = true,
      ...props
    },
    ref
  ) => {
    const colorMap = {
      primary: {
        border: "border-amber-200",
        spinBorder: "border-t-amber-500",
        gradient: "from-amber-500 to-yellow-500",
        conicColor: "#f59e0b",
        text: "text-amber-600",
      },
      secondary: {
        border: "border-blue-200",
        spinBorder: "border-t-blue-500",
        gradient: "from-blue-500 to-cyan-500",
        conicColor: "#3b82f6",
        text: "text-blue-600",
      },
    };

    const colors = colorMap[color];
    const spinnerSize = size === "lg" ? "w-16 h-16" : "w-12 h-12";

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center", className)}
        {...props}
      >
        <div className={cn("mb-4 relative", spinnerSize)}>
          {/* 背景圆环 */}
          <div
            className={cn(
              "absolute inset-0 rounded-full border-4",
              colors.border
            )}
          />

          {/* 旋转的进度圆环 */}
          <div
            className={cn(
              "absolute inset-0 rounded-full border-4 border-transparent animate-spin",
              colors.spinBorder
            )}
            style={{
              background: `conic-gradient(from 0deg, transparent ${
                100 - progress
              }%, ${colors.conicColor} ${100 - progress}%)`,
              WebkitMask:
                "radial-gradient(circle at center, transparent 70%, black 70%)",
              mask: "radial-gradient(circle at center, transparent 70%, black 70%)",
            }}
          />
        </div>

        {message && (
          <p className={cn("text-sm text-center mb-2", colors.text)}>
            {message}
          </p>
        )}

        {showProgressBar && (
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "bg-gradient-to-r h-2 rounded-full transition-all duration-300",
                colors.gradient
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showPercentage && (
          <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
        )}
      </div>
    );
  }
);
ProgressSpinner.displayName = "ProgressSpinner";

// 4. 全屏Loader组件 - 适用于页面级别loading
export interface FullScreenLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subMessage?: string;
  background?: "light" | "dark" | "blur";
}

export const FullScreenLoader = React.forwardRef<
  HTMLDivElement,
  FullScreenLoaderProps
>(({ className, message, subMessage, background = "light", ...props }, ref) => {
  const tCommon = useTranslations("Common");
  const backgroundClasses = {
    light: "bg-gray-50/80",
    dark: "bg-black/60",
    blur: "bg-white/80 backdrop-blur-sm",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-screen flex items-center justify-center",
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      <div className="text-center">
        <SimpleSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-amber-700 font-medium">
          {message ?? tCommon("loading")}
        </p>
        {subMessage && (
          <p className="text-gray-600 text-sm mt-2">{subMessage}</p>
        )}
      </div>
    </div>
  );
});
FullScreenLoader.displayName = "FullScreenLoader";

// 5. 水平Loader组件 - 适用于header、导航等横向区域
export interface HorizontalLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: "sm" | "md";
  color?: "primary" | "secondary";
  showIcon?: boolean;
}

export const HorizontalLoader = React.forwardRef<
  HTMLDivElement,
  HorizontalLoaderProps
>(
  (
    {
      className,
      message,
      size = "sm",
      color = "primary",
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const tCommon = useTranslations("Common");

    const colorClasses = {
      primary: {
        spinner: "border-amber-200 border-t-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-50/60",
      },
      secondary: {
        spinner: "border-blue-200 border-t-blue-500",
        text: "text-blue-700",
        bg: "bg-blue-50/60",
      },
    };

    const sizeClasses = {
      sm: {
        container: "h-10 px-4 gap-2",
        spinner: "w-4 h-4",
        text: "text-sm",
      },
      md: {
        container: "h-12 px-6 gap-3",
        spinner: "w-5 h-5",
        text: "text-base",
      },
    };

    const colors = colorClasses[color];
    const sizes = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-transparent transition-all duration-300",
          colors.bg,
          sizes.container,
          className
        )}
        {...props}
      >
        {showIcon && (
          <div
            className={cn(
              "animate-spin rounded-full border-2",
              colors.spinner,
              sizes.spinner
            )}
          />
        )}
        <span className={cn("font-medium", colors.text, sizes.text)}>
          {message || tCommon("loading")}
        </span>
      </div>
    );
  }
);
HorizontalLoader.displayName = "HorizontalLoader";

// 导出所有组件和类型
export { spinnerVariants, loaderVariants };
