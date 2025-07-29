import { CheckCircle, Lock } from "lucide-react";

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
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
        isActive
          ? "border-blue-500 shadow-blue-100"
          : isCompleted
          ? "border-green-500 shadow-green-100"
          : isLocked
          ? "border-gray-200 opacity-60"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-blue-500 text-white"
              : isLocked
              ? "bg-gray-300 text-gray-500"
              : "bg-gray-100 text-gray-600"
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
            <span className="text-sm font-medium text-gray-500">
              步骤 {step}
            </span>
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <h3
            className={`text-lg font-semibold ${
              isLocked ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              isLocked ? "text-gray-400" : "text-gray-600"
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
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isActive
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {actionButton.text}
          </button>
        </div>
      )}

      {isLocked && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">完成上一步后解锁</div>
        </div>
      )}
    </div>
  );
}
