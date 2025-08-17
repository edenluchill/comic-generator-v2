import { CheckCircle, Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  isActive: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  children?: React.ReactNode;
  actionButton?: { text: string; onClick: () => void; disabled?: boolean };
}

export function StepCard({
  step,
  title,
  description,
  icon: Icon,
  isActive,
  isCompleted,
  isLocked,
  children,
  actionButton,
}: StepCardProps) {
  const t = useTranslations("WorkshopPage");

  return (
    <div
      className={`bg-card rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
        isActive
          ? "border-primary shadow-primary/20"
          : isCompleted
          ? "border-chart-3 shadow-chart-3/20"
          : isLocked
          ? "border-border opacity-60"
          : "border-border"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-chart-3 text-white"
              : isActive
              ? "bg-primary text-primary-foreground"
              : isLocked
              ? "bg-muted text-muted-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-6 h-6" />
          ) : isLocked ? (
            <Lock className="w-6 h-6" />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("stepNumber", { step })}
            </span>
            {isCompleted && <CheckCircle className="w-4 h-4 text-chart-3" />}
          </div>
          <h3
            className={`text-lg font-semibold ${
              isLocked ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {!isLocked && children && <div className="mb-4">{children}</div>}

      {!isLocked && actionButton && (
        <div className="flex justify-center">
          <button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              actionButton.disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : isActive
                ? "btn-theme-primary shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gradient-to-r from-chart-3 to-chart-4 hover:from-chart-3/80 hover:to-chart-4/80 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {actionButton.text}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="text-center py-4">
          <div className="text-muted-foreground text-sm">
            {t("completeToUnlock")}
          </div>
        </div>
      )}
    </div>
  );
}
