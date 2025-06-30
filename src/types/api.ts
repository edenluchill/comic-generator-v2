// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  currentTask: string;
  percentage: number;
}
